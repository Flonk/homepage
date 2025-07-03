---
title: "Create OpenShift clusters for testing (in Azure, and locally)"
description: ""
pubDate: "Aug 1 2023"
---

This was originally posted at my [employer's blog](https://andamp.io/blog/create-openshift-clusters-for-testing-in-azure-and-locally), I'm keeping it here for posterity.

You’re a dev, and you need an OpenShift cluster to test your deployments? Been there! Here are your options for how you can get from zero to cluster quickly:

- Set up a cluster on dedicated hardware
- Set up a cluster in the cloud, for example in Azure
- Run crc (OpenShift local) on your dev machine
- The unlikely hero: Run crc in the cloud

---

## Option 1: Dedicated hardware

Ask your Ops team, they’ll know better.

## Option 2: Set up a cluster in Azure

Azure makes spinning up OpenShift clusters pretty convenient. They have a [separate product page for OpenShift](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.RedHatOpenShift%2FOpenShiftClusters) where you can create clusters with just a few mouse clicks.

### 2.1 Why it’s probably a bad idea

OpenShift clusters run on 6 nodes minimum. This is not an Azure restriction, it’s an OpenShift restriction. This means you need to rent 6 fairly beefy machines, which is expensive.

Also, you cannot suspend the VMs that the cluster is running on. [As of August 2023, this is still disallowed by Azure](https://github.com/Azure/OpenShift/issues/207), and it means that you need to pay for all 6 machines 24/7, even if you don’t currently need the cluster.

Of course, you can destroy the cluster and spin up a new one when needed, but considering the effort involved (~45 minutes setup time, installing argocd, deploying your project) that’s hardly ideal.

### 2.2 I want to do it anyway

Sure. Before deploying your first cluster, a few things do need to happen first:

#### 2.2.1 Configure an Azure Service Principal

Which is like an active directory user but for applications. Azure’s OpenShift wizard will spin up 6 VMs, as well as storage and virtual networks, so it needs a service principal that is allowed to do so.

- Go to [Azure Active Directory > App registrations](https://portal.azure.com/?l=en.en-us#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
- Create a new application, for example `app-openshift-test`
- Ask your trusted Azure Active Directory admin to give your app the necessary roles, for it to be able to deploy and delete resources in your current Azure subscription (for example, the Contributor role).
- Go to your application and navigate to “Certificates & secrets”, and generate a new client secret — this will be used in the OpenShift deployment wizard.

#### 2.2.2 Configure your Azure Subscription

- Enable the Azure Storage Provider using the Azure CLI: `az provider register --namespace Microsoft.Storage`
- [Request a quota increase for Dsv3 CPUs in your region](https://portal.azure.com/?l=en.en-us#view/Microsoft_Azure_Capacity/QuotaMenuBlade/~/myQuotas). By default, you may only rent 10 CPU cores of any given VM type, so as to not blow out your wallet. The smallest possible OpenShift cluster will need 36 CPU cores though.

#### 2.2.3 Run the OpenShift deployment wizard

- Create a resource group in your subscription, for example rg-openshift-test
- Add a new OpenShift cluster in your resource group, here: [Microsoft Azure](https://portal.azure.com/?l=en.en-us#view/HubsExtension/BrowseResource/resourceType/Microsoft.RedHatOpenShift%2FOpenShiftClusters)
- Choose an appropriate cluster name (for example `osopenshifttest`), domain name (for example `openshifttest`), and cluster size.
- In the authentication tab, add the “Application Id” of your previously generated application, the client secret, and your red hat pull secret
- The pull secret can be obtained from the [Red Hat Developer Console](https://console.redhat.com/openshift/install/azure/aro-provisioned), so create a Red Hat account if you don’t have one.
- Keep the rest as-is, and click “Create”.
- Wait until the deployment is complete, it will take at most one hour.

You should be able to log into the cluster now, you can find the URL to your cluster in the OpenShift resource. Login credentials can be obtained via the azure cli.

```bash
λ> az aro list-credentials --name osopenshifttest --resource-group rg-openshift-test
{ "kubeadminPassword": "er123-45kV3-EbkC7-KuQNv", "kubeadminUsername": "kubeadmin" }
```

## Option 3: Run crc (OpenShift local) on your dev machine

Red Hat provides a tool called crc (formerly code-ready containers) which makes it possible to run OpenShift on a single node. The cluster is slightly stripped down (no monitoring and a few other things) but it functions mostly like a normal cluster.

### 3.1 Setup

Register an account at the [Red Hat Hybrid Cloud Console](https://console.redhat.com/), there you can find a download link for crc in the downloads section.

Running crc is as simple as running `crc setup`, running basic configuration, and then running `crc start`, all from the terminal. All in all, it takes about… 30-45 minutes to get the cluster up and running.

### 3.2 Configuration

You should configure crc’s memory and CPU limits because the defaults are way too low.

```bash
crc config set cpus 6
crc config set memory 32000
crc config set disk-size 120
crc config set pull-secret-file /home/flo/pull-secret
crc config set kubeadmin-password changeme
```

What’s this pull-secret file you ask?

I’m not totally sure, to be honest, but I think OpenShift needs it to interact with the Red Hat operator marketplace. You can download your pull secret from the red hat console, in the downloads section, where you downloaded crc.

### 3.3 Why that’s maybe a bad idea too

crc is extremely resource hungry. In our tests, we constantly had issues with the cluster crashing, `crc start` not being able to start the cluster, the cluster not being able to spin up pods because of memory limits, and it even crashing my laptop.

The default memory limits are barely enough to run the naked cluster, as soon as you click a button or deploy anything it all comes down. And when you need to set the memory limits to 30+ GB just to run a basic application, you need a seriously beefy machine to run crc.

Also, there’s the obvious problem that the cluster runs on your machine, and other team members have no access to it. Which could be fine for a dev environment though.

## Option 4: Run crc in the cloud

This is the middle ground. You only need a single, large-ish VM, and not 6 like with option 2. It’s accessible to your entire team, unlike option 3.

Also, you can stop the VM whenever it’s not needed, saving on costs.

It’s just a bit of a hassle to set up. Here’s a rough overview of how you would set up a VM running crc in Azure.

### 4.1 Spin up a VM

We recommend at least 8 cores and at least 32 Gigs of RAM. The `Standard_D8ds_v4` machine type has worked well for us. I don’t think it’s strictly necessary, but we chose to use a CentOS 7 image, which is like an open-source Red Hat Enterprise distribution.

Be sure to open incoming TCP ports 22, 80, 443, and 6443. (The last one is used by the OpenShift container registry.)

We chose to open all outgoing ports because whatever you deploy into the cluster might need them, but this is optional.

### 4.2 Attach a data disk

Azure VMs have ephemeral disks which will not retain data when you reboot the machine. You need to attach another disk for persistent storage, we went with 128 GB.

Mount, format, and partition the disk using ext4. Then, copy the `/home` directory onto the disk, then mount the disk again, such that `/home` now points to the disk you attached. crc will store all its data inside the `/home` directory.

This tutorial has been very helpful to set up the disk and a file system: [How To Partition and Format Storage Devices in Linux](https://www.digitalocean.com/community/tutorials/how-to-partition-and-format-storage-devices-in-linux)

### 4.3 Download and install crc

As well as `oc` (The OpenShift `cli`), `kubectl`, or whatever other tools you need. Then run `crc` configuration like described in Option 3.

### 4.4 Configure HAProxy

crc runs inside a virtual machine, and you need to proxy all the traffic on ports 80, 443, and 6443 to the virtual machine. This is most easily achieved by installing HAProxy. Here’s a sample haproxy.cfg:

```bash
global
  log /dev/log local0
defaults
  balance roundrobin
  log global
  maxconn 100
  mode tcp
  timeout connect 5s
  timeout client 500s
  timeout server 500s
listen apps
  bind 0.0.0.0:80
  server crcvm CRC_IP:80 check
listen apps_ssl
  bind 0.0.0.0:443
  server crcvm CRC_IP:443 check
listen api
  bind 0.0.0.0:6443
  server crcvm CRC_IP:6443 check
```

Be sure to replace `CRC_IP` with whatever local IP your crc installation is using. You can find it by running the command crc ip.

For some reason, you also need this. Run it once in a terminal:

```bash
sudo setsebool -P haproxy_connect_any=1
```

### 4.5 Enable HAProxy on startup, and create a startup script for crc

This is so you don’t have to ssh onto the cluster every time you start the VM and start crc.

HAProxy comes with a systemd service, you can simply `systemctl enable haproxy && systemctl start haproxy`.

For crc you need to write your own, this is what we came up with:

```ini
[Unit]
Description=OpenShift Local
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=/usr/bin/crc start
ExecStop=/usr/bin/crc stop
Type=oneshot
RemainAfterExit=yes
TimeoutSec=1200
User=azureuser
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Put this in a file called `/usr/lib/systemd/system/crc.service`, then run `systemctl enable crc && systemctl start crc`.

Congrats, you should have a running instance of crc now. :)

### 4.6 Configure your local development machine

crc is meant to be run locally, so we need to trick your local machine into thinking there’s a crc cluster running. This means that we need to route DNS traffic to `apps-crc.testing` and `crc.testing` domains to the newly created cluster.

The easiest way is to install a local DNS server and make your machine use it, using dnsmasq and resolvconf.

```bash
λ> apt install dnsmasq resolvconf

λ> cat /etc/dnsmasq.conf
address=/apps-crc.testing/10.208.40.173 # replace with the cluster ip
address=/crc.testing/10.208.40.173 # replace with the cluster ip
listen-address=127.0.0.1

λ> cat /etc/resolvconf/resolv.conf.d/base
nameserver 127.0.0.1

λ> resolvconf -u

λ> systemctl restart dnsmasq
```

Not sure if this is the recommended way to do it for all the Mac OS X folks out there, sorry.

If you did all this correctly, you should be able to access https://console-openshift-console.apps-crc.testing/ in your local browser and start DevOpsing. 🎉

### Pitfall: ArgoCD

You can install ArgoCD via the OpenShift OperatorHub. Red Hat provides an operator called the “OpenShift GitOps operator” which is basically a preconfigured ArgoCD.

However, OpenShift’s security model is very restrictive, and the service account ArgoCD runs under (`openshift-gitops-argocd-application-controller`) won’t have permission to provision most resources. We circumvented this by creating a “super admin” group that can do anything. Don’t do this in production!

```yaml
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
name: cr-super-admin
rules:

- verbs:
  - '\*'
    apiGroups:
  - '\*'
    resources:
  - '\*'
```

Then assign the ArgoCD user that role.

```yaml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
name: crb-gitops-super-admin
subjects:

- kind: ServiceAccount
  name: openshift-gitops-argocd-application-controller
  namespace: openshift-gitops
  roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cr-super-admin
```

Happy hacking!

There are a lot of issues we ran into that I haven’t discussed here, regarding Azure, OpenShift, and other things. If you run into trouble, be sure to let me know — maybe I can help out.

At &amp, we build solutions, big and small. Need to get your product off the ground and a gnarly app to go along with it? We got you covered. Are you migrating your company’s infrastructure to the cloud and your operations team isn’t equipped to handle the challenges? Rent one of our teams of experienced DevOps engineers.
