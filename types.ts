
export interface VNTRRegion {
  id: string;
  start: number; // 1-based
  end: number;   // 1-based
  repeats: number;
  length: number;
  motif: string;
  context: {
    before: string;
    repeat: string;
    after: string;
  };
}

export interface SequenceResult {
  id: string;
  name: string;
  originalHeader: string;
  sequence: string;
  length: number;
  regions: VNTRRegion[];
  density: number; // VNTR regions per 1000bp
}

export type InputMode = 'upload' | 'text' | 'sample';

export interface AnalysisOptions {
  motif: string;
  minRepeats: number;
}
