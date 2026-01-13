
import { SequenceResult, VNTRRegion, AnalysisOptions } from '../types';

/**
 * Cleans a sequence by removing non-standard characters and converting to uppercase.
 */
export const cleanSequence = (seq: string): string => {
  return seq.toUpperCase().replace(/[^ACGTU]/g, '');
};

/**
 * Parses FASTA formatted text into individual sequence records.
 */
export const parseFasta = (text: string): { name: string; sequence: string; header: string }[] => {
  const parts = text.trim().split(/^>/m).filter(p => p.trim());
  
  if (!text.trim().startsWith('>')) {
    return [{
      name: 'User Sequence',
      sequence: cleanSequence(text),
      header: 'Plain Text Input'
    }];
  }

  return parts.map(part => {
    const lines = part.split(/\r?\n/);
    const header = lines.shift() || 'Unnamed Sequence';
    const sequence = cleanSequence(lines.join(''));
    return {
      name: header.split(' ')[0],
      header,
      sequence
    };
  });
};

/**
 * Finds consecutive repeats of a motif in a sequence.
 */
export const findVNTRs = (
  sequence: string, 
  motif: string, 
  minRepeats: number
): VNTRRegion[] => {
  const regions: VNTRRegion[] = [];
  if (!motif || sequence.length < motif.length * minRepeats) return regions;

  const escapedMotif = motif.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Regex for finding consecutive repeats: (MOTIF){minRepeats,}
  const regex = new RegExp(`(${escapedMotif}){${minRepeats},}`, 'gi');
  
  let match;
  while ((match = regex.exec(sequence)) !== null) {
    const matchedText = match[0];
    const startIndex = match.index;
    const repeats = matchedText.length / motif.length;
    const regionLength = matchedText.length;
    
    // 1-based positions for scientific standards
    const startPos = startIndex + 1;
    const endPos = startIndex + regionLength;

    regions.push({
      id: `vntr-${Math.random().toString(36).substr(2, 9)}`,
      start: startPos,
      end: endPos,
      repeats,
      length: regionLength,
      motif: motif.toUpperCase(),
      context: {
        repeat: matchedText.toUpperCase(),
        before: sequence.slice(Math.max(0, startIndex - 20), startIndex).toUpperCase(),
        after: sequence.slice(startIndex + regionLength, startIndex + regionLength + 20).toUpperCase()
      }
    });
  }
  
  return regions;
};

/**
 * Runs the full analysis pipeline.
 */
export const analyzeSequences = (
  input: string, 
  options: AnalysisOptions
): SequenceResult[] => {
  const parsed = parseFasta(input);
  const motif = options.motif.toUpperCase();
  
  return parsed.map(p => {
    const regions = findVNTRs(p.sequence, motif, options.minRepeats);
    const density = p.sequence.length > 0 ? (regions.length / p.sequence.length) * 1000 : 0;
    
    return {
      id: `seq-${Math.random().toString(36).substr(2, 9)}`,
      name: p.name,
      originalHeader: p.header,
      sequence: p.sequence,
      length: p.sequence.length,
      regions,
      density
    };
  });
};
