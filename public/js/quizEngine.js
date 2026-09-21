import { sample, shuffle, uid } from './util.js';

function hasCloze(entry) {
  return Boolean(entry.example && entry.example.includes('{{word}}'));
}

function synAntSubtypesAvailable(entry) {
  const subtypes = [];
  if (entry.synonyms?.length) subtypes.push('synonym');
  if (entry.antonyms?.length) subtypes.push('antonym');
  if (entry.definition) subtypes.push('paraphrase');
  return subtypes;
}

function buildClozeQuestion(entry) {
  const promptSentence = entry.example.replace('{{word}}', '_____');
  return {
    id: uid(),
    type: 'cloze',
    entryId: entry.id,
    prompt: promptSentence,
    fullSentence: entry.example.replace('{{word}}', entry.en),
    accepted: [entry.en],
    de: entry.de,
  };
}

function buildSynAntQuestion(entry) {
  const subtypes = synAntSubtypesAvailable(entry);
  const subtype = subtypes[Math.floor(Math.random() * subtypes.length)];
  if (subtype === 'synonym') {
    return {
      id: uid(),
      type: 'synant',
      subtype,
      entryId: entry.id,
      prompt: `Nenne ein Synonym (ein bedeutungsähnliches Wort) für: "${entry.en}"`,
      accepted: entry.synonyms,
      de: entry.de,
    };
  }
  if (subtype === 'antonym') {
    return {
      id: uid(),
      type: 'synant',
      subtype,
      entryId: entry.id,
      prompt: `Nenne das Gegenteil von: "${entry.en}"`,
      accepted: entry.antonyms,
      de: entry.de,
    };
  }
  return {
    id: uid(),
    type: 'synant',
    subtype: 'paraphrase',
    entryId: entry.id,
    prompt: `Welches Wort wird hier auf Englisch umschrieben? "${entry.definition}"`,
    accepted: [entry.en],
    de: entry.de,
  };
}

function buildSentenceQuestion(entry) {
  return {
    id: uid(),
    type: 'sentence',
    entryId: entry.id,
    prompt: `Schreibe einen vollständigen englischen Satz mit dem Wort "${entry.en}" (${entry.de}).`,
    modelSentence: entry.example ? entry.example.replace('{{word}}', entry.en) : null,
    de: entry.de,
    en: entry.en,
  };
}

export function generateQuiz(vocabSet, config) {
  const warnings = [];
  const questions = [];

  const clozePool = vocabSet.entries.filter(hasCloze);
  const clozeWanted = config.cloze ?? 0;
  if (clozeWanted > 0) {
    if (clozePool.length < clozeWanted) {
      warnings.push(`Nur ${clozePool.length} Vokabel(n) mit Beispielsatz verfügbar (gewünscht: ${clozeWanted}).`);
    }
    sample(clozePool, Math.min(clozeWanted, clozePool.length)).forEach((entry) => {
      questions.push(buildClozeQuestion(entry));
    });
  }

  const synAntPool = vocabSet.entries.filter((e) => synAntSubtypesAvailable(e).length > 0);
  const synAntWanted = config.synAnt ?? 0;
  if (synAntWanted > 0) {
    if (synAntPool.length < synAntWanted) {
      warnings.push(`Nur ${synAntPool.length} Vokabel(n) mit Synonym/Antonym/Definition verfügbar (gewünscht: ${synAntWanted}).`);
    }
    sample(synAntPool, Math.min(synAntWanted, synAntPool.length)).forEach((entry) => {
      questions.push(buildSynAntQuestion(entry));
    });
  }

  const sentencePool = vocabSet.entries.filter((e) => e.en);
  const sentenceWanted = config.sentence ?? 0;
  if (sentenceWanted > 0) {
    if (sentencePool.length < sentenceWanted) {
      warnings.push(`Nur ${sentencePool.length} Vokabel(n) verfügbar (gewünscht: ${sentenceWanted}).`);
    }
    sample(sentencePool, Math.min(sentenceWanted, sentencePool.length)).forEach((entry) => {
      questions.push(buildSentenceQuestion(entry));
    });
  }

  return { questions: shuffle(questions), warnings };
}
