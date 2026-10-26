import type { b2Fixture } from '@box2d/core';
import type { b2ParticleSystem } from '@box2d/particles';

export type Part = { id: string; label: string; share: number };

/* A part once still: its level, the floor on it, and, while it turns
   from drops into a layer, the drops as they last lay and how far it
   has turned, from 0 to 1. */
export type Layer = { part: number; level: number; floor: b2Fixture; drops: { x: number; y: number }[]; shown: number };
/* What is being poured: how much of it is in, how long since it all
   was, the level it was last seen settling at and how long it has
   kept to it. */
export type Pouring = { part: number; system: b2ParticleSystem; poured: number; since: number; level: number; steady: number };
// A part's canvas and filter, its drops' size and how many of them.
export type Liquid = {
	radius: number;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	blur: SVGFEGaussianBlurElement;
	quota: number;
};

/* A glass as its pouring, its settling and its drawing all have it: what
   it holds and is to hold, and where on its canvases it is drawn, the one
   glass seen alike from each. */
export type Pour = {
	root: HTMLElement;
	parts: Part[];
	liquids: Liquid[];
	wanted: Set<string>;
	colour: string[];
	// A CSS colour as numbers from 0 to 1, red, green, blue and alpha, as a canvas paints it.
	rgba: (css: string) => number[];
	layers: Layer[];
	pouring: Pouring | null;
	// Whether a layer has turned further since the layers were last drawn.
	turned: boolean;
	w: number;
	h: number;
	dpr: number;
	scale: number;
	ox: number;
	oy: number;
	sx: (x: number) => number;
	sy: (y: number) => number;
};
