import { uid } from './util.js';

const RAW_ENTRIES = [
  { en: 'suitcase', de: 'der Koffer', example: 'She had already packed her {{word}} when her mum reminded her to take a jacket.', synonyms: ['bag'], antonyms: [], definition: 'a case with a handle that you use for carrying your clothes when you travel' },
  { en: 'passport', de: 'der Reisepass', example: 'At the check-in desk, he suddenly realised that he had left his {{word}} at home.', synonyms: [], antonyms: [], definition: 'an official document that shows who you are and which country you come from, needed for travelling abroad' },
  { en: 'to arrive', de: 'ankommen', example: 'After a four-hour flight, they finally {{word}} in London.', synonyms: ['to land'], antonyms: ['to depart', 'to leave'], definition: 'to reach the place you were travelling to' },
  { en: 'to depart', de: 'abreisen, abfahren', example: 'The plane {{word}} from Berlin at six o’clock in the morning.', synonyms: ['to leave'], antonyms: ['to arrive'], definition: 'to leave a place, especially at the start of a journey' },
  { en: 'journey', de: 'die Reise, die Fahrt', example: 'It had been a long {{word}}, so everyone was tired when the plane finally landed.', synonyms: ['trip'], antonyms: [], definition: 'the act of travelling from one place to another' },
  { en: 'luggage', de: 'das Gepäck', example: 'They had been carrying their heavy {{word}} for almost an hour before they found a taxi.', synonyms: ['baggage'], antonyms: [], definition: 'the bags and suitcases that you take with you when you travel' },
  { en: 'tourist', de: 'der Tourist, die Touristin', example: 'Thousands of {{word}}s visit Buckingham Palace every year.', synonyms: [], antonyms: ['local'], definition: 'a person who is travelling or visiting a place for pleasure' },
  { en: 'to explore', de: 'erkunden', example: 'Once they had checked into the hotel, they went out to {{word}} the city.', synonyms: ['to discover'], antonyms: [], definition: 'to travel through a place in order to learn about it' },
  { en: 'crowded', de: 'überfüllt', example: 'The Underground was extremely {{word}} during rush hour.', synonyms: ['packed', 'busy'], antonyms: ['empty'], definition: 'full of people' },
  { en: 'exhausted', de: 'erschöpft', example: 'By the time they reached the hotel, they were completely {{word}} because they had been walking all day.', synonyms: ['tired out'], antonyms: ['energetic'], definition: 'extremely tired' },
  { en: 'amazing', de: 'erstaunlich, großartig', example: 'The view from the London Eye was absolutely {{word}}.', synonyms: ['fantastic', 'incredible'], antonyms: ['disappointing'], definition: 'causing great surprise or wonder; extremely good' },
  { en: 'souvenir', de: 'das Andenken, das Souvenir', example: 'Emma bought a small {{word}} for her grandmother.', synonyms: [], antonyms: [], definition: 'an object that you keep to remind you of a place you visited' },
  { en: 'sightseeing', de: 'die Besichtigungstour, das Sightseeing', example: 'On their second day, the family went {{word}} in the city centre.', synonyms: [], antonyms: [], definition: 'the activity of visiting the interesting places that tourists usually go to' },
  { en: 'to get lost', de: 'sich verlaufen, sich verirren', example: 'They {{word}} on their way to the Tower of London because they had taken the wrong bus.', synonyms: ['to lose your way'], antonyms: [], definition: 'to not know where you are or how to get to where you want to go' },
  { en: 'the Underground', de: 'die Londoner U-Bahn', example: 'They took {{word}} to get from the hotel to the museum.', synonyms: ['the tube'], antonyms: [], definition: 'London’s underground railway system' },
  { en: 'to check in', de: 'einchecken', example: 'Before they could board the plane, they had to {{word}} at the airport.', synonyms: [], antonyms: ['to check out'], definition: 'to arrive and show your ticket at an airport or hotel before your flight or stay' },
  { en: 'queue', de: 'die Warteschlange', example: 'There was a long {{word}} in front of Buckingham Palace.', synonyms: ['line'], antonyms: [], definition: 'a line of people waiting for something' },
  { en: 'to queue', de: 'Schlange stehen, anstehen', example: 'They had been queuing for over an hour when the doors finally opened.', synonyms: ['to wait in line'], antonyms: [], definition: 'to stand in a line, waiting for something' },
  { en: 'tour guide', de: 'der Reiseführer, die Reiseführerin (Person)', example: 'The {{word}} showed them around the Tower of London.', synonyms: [], antonyms: [], definition: 'a person whose job is to show tourists around a place' },
  { en: 'to pack', de: 'packen', example: 'She {{word}} her bag the night before the trip.', synonyms: [], antonyms: ['to unpack'], definition: 'to put your clothes and things into a bag or suitcase before travelling' },
];

export function createDefaultSet() {
  return {
    id: uid(),
    name: 'Klasse 7: Our trip to London',
    entries: RAW_ENTRIES.map((e) => ({ id: uid(), ...e })),
  };
}

export function createEmptyEntry() {
  return { id: uid(), en: '', de: '', example: '', synonyms: [], antonyms: [], definition: '' };
}
