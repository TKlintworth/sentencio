// utils/slugGenerator.ts 

const CONSONANTS = 'BCDFGHJKMNPQRSTVWXYZ'
const VOWELS = 'AEIOUY'
const SLUG_LENGTH = 5

export function generateSlug(): string {
    // Generate CON-VOW-CON-VOW-NUM slug
    // Example: FABU5
    let slug = '';
    
    while (slug.length < SLUG_LENGTH) {
        if (slug.length < 4) {
            slug += generateRandomConsonantVowelPair();
        } else {
            slug += getRandomNumber();
        }
    }

    console.log("Slug: ", slug);
    return slug;
}

function getRandomVowel(): string {
    return VOWELS[Math.floor(Math.random() * VOWELS.length)]
}

function getRandomNumber(): string {
    return String(Math.floor(Math.random() * 10));
}

function getRandomConsonant(): string {
    return CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]
}

function generateRandomConsonantVowelPair(): string {
    return getRandomConsonant() + getRandomVowel();
}