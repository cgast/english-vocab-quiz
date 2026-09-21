import { uid } from './util.js';

const RAW_ENTRIES = [
  { en: 'brave', de: 'mutig', example: 'Even though she was scared, she stayed {{word}} and helped her friend.', synonyms: ['courageous', 'bold'], antonyms: ['scared', 'cowardly'], definition: 'showing no fear when facing something difficult or dangerous' },
  { en: 'shy', de: 'schüchtern', example: 'He was too {{word}} to talk to the new students on his first day.', synonyms: ['timid'], antonyms: ['confident', 'outgoing'], definition: 'nervous or uncomfortable about meeting and talking to other people' },
  { en: 'friendly', de: 'freundlich', example: 'Our new neighbours are very {{word}} and always say hello.', synonyms: ['kind', 'nice'], antonyms: ['unfriendly', 'hostile'], definition: 'behaving in a pleasant, kind way towards other people' },
  { en: 'rude', de: 'unhöflich', example: 'It was {{word}} of him to interrupt the teacher like that.', synonyms: ['impolite'], antonyms: ['polite', 'courteous'], definition: 'not showing respect for other people; not polite' },
  { en: 'polite', de: 'höflich', example: 'She was very {{word}} and thanked everyone for coming.', synonyms: ['courteous'], antonyms: ['rude', 'impolite'], definition: 'having good manners and showing respect for other people' },
  { en: 'boring', de: 'langweilig', example: 'The lesson was so {{word}} that half the class fell asleep.', synonyms: ['dull'], antonyms: ['exciting', 'interesting'], definition: 'not interesting or exciting at all' },
  { en: 'exciting', de: 'aufregend', example: 'Our trip to London was the most {{word}} thing we did this year.', synonyms: ['thrilling'], antonyms: ['boring', 'dull'], definition: 'making you feel very interested or enthusiastic' },
  { en: 'careful', de: 'vorsichtig', example: 'Please be {{word}} when you cross the busy road.', synonyms: ['cautious'], antonyms: ['careless'], definition: 'paying close attention to what you are doing so that nothing bad happens' },
  { en: 'careless', de: 'unvorsichtig, nachlässig', example: 'It was {{word}} of him to leave his bike unlocked outside the shop.', synonyms: ['sloppy'], antonyms: ['careful'], definition: 'not paying enough attention to what you are doing' },
  { en: 'honest', de: 'ehrlich', example: 'To be {{word}}, I didn’t enjoy the film at all.', synonyms: ['truthful'], antonyms: ['dishonest'], definition: 'always telling the truth and not stealing or cheating' },
  { en: 'jealous', de: 'eifersüchtig, neidisch', example: 'He felt {{word}} when his brother got a new bike and he didn’t.', synonyms: ['envious'], antonyms: [], definition: 'feeling unhappy because someone else has something you want' },
  { en: 'proud', de: 'stolz', example: 'My parents were {{word}} of me when I passed my exam.', synonyms: [], antonyms: ['ashamed'], definition: 'feeling pleased about something you or someone close to you has achieved' },
  { en: 'to argue', de: 'streiten', example: 'My little sister and I always {{word}} about which TV show to watch.', synonyms: ['to quarrel', 'to fight'], antonyms: ['to agree'], definition: 'to talk angrily with someone because you disagree with them' },
  { en: 'to apologize', de: 'sich entschuldigen', example: 'He called her to {{word}} for being late.', synonyms: ['to say sorry'], antonyms: [], definition: 'to tell someone that you are sorry for something you did wrong' },
  { en: 'to forgive', de: 'verzeihen, vergeben', example: 'It took her a while, but she finally decided to {{word}} her brother.', synonyms: ['to pardon'], antonyms: [], definition: 'to stop being angry with someone who has done something wrong to you' },
  { en: 'to borrow', de: '(sich) leihen', example: 'Can I {{word}} your dictionary for the vocabulary test?', synonyms: [], antonyms: ['to lend'], definition: 'to take and use something that belongs to someone else and give it back later' },
  { en: 'to lend', de: 'verleihen, ausleihen', example: 'Could you {{word}} me five euros until tomorrow?', synonyms: [], antonyms: ['to borrow'], definition: 'to give something to someone for a period of time, expecting it back' },
  { en: 'similar', de: 'ähnlich', example: 'Her handwriting is very {{word}} to her mother’s.', synonyms: ['alike'], antonyms: ['different'], definition: 'looking or being almost, but not exactly, the same' },
  { en: 'different', de: 'unterschiedlich, verschieden', example: 'The two brothers have completely {{word}} personalities.', synonyms: [], antonyms: ['similar', 'same'], definition: 'not the same as something or someone else' },
  { en: 'to trust', de: 'vertrauen', example: 'You can {{word}} him – he always keeps his promises.', synonyms: ['to rely on'], antonyms: ['to doubt'], definition: 'to believe that someone is honest and will not harm you' },
];

export function createDefaultSet() {
  return {
    id: uid(),
    name: 'Beispiel: Charakter & Beziehungen',
    entries: RAW_ENTRIES.map((e) => ({ id: uid(), ...e })),
  };
}

export function createEmptyEntry() {
  return { id: uid(), en: '', de: '', example: '', synonyms: [], antonyms: [], definition: '' };
}
