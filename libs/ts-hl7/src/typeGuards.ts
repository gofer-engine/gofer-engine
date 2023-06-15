import { Segment, Segments } from "./types";

export const isSegmentArray = (segments: Segment | Segments): segments is Segments => Array.isArray(segments[0])