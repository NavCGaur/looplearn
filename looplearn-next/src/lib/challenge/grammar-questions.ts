import { GrammarQuestion } from './types';

export const GRAMMAR_QUESTIONS: Record<number, GrammarQuestion[]> = {
    // -------------------------------------------------------------------------
    // DAY 1: IS / AM / ARE, WAS / WERE, PRONOUNS (10 questions)
    // -------------------------------------------------------------------------
    1: [
        {
            id: "d1_q1",
            question: "I _______ a student in Class 7.",
            options: ["am", "is", "are", "were"],
            correctAnswer: "am",
            explanation: "'I' ke saath present tense mein hamesha 'am' lagta hai.",
            topic: "IS/AM/ARE"
        },
        {
            id: "d1_q2",
            question: "She _______ reading an interesting English storybook right now.",
            options: ["is", "am", "are", "were"],
            correctAnswer: "is",
            explanation: "Singular subject (He/She/It/Name) ke saath 'is' use hota hai.",
            topic: "IS/AM/ARE"
        },
        {
            id: "d1_q3",
            question: "They _______ playing football on the school ground.",
            options: ["are", "is", "am", "was"],
            correctAnswer: "are",
            explanation: "Plural subject (They/We/You) ke saath present mein 'are' use hota hai.",
            topic: "IS/AM/ARE"
        },
        {
            id: "d1_q4",
            question: "Yesterday, Amit _______ absent from school.",
            options: ["was", "were", "is", "are"],
            correctAnswer: "was",
            explanation: "'Yesterday' (past) mein singular subject ke saath 'was' lagta hai.",
            topic: "WAS/WERE"
        },
        {
            id: "d1_q5",
            question: "We _______ very happy with our test marks yesterday.",
            options: ["were", "was", "is", "am"],
            correctAnswer: "were",
            explanation: "Past tense mein plural subject 'We' ke saath 'were' lagta hai.",
            topic: "WAS/WERE"
        },
        {
            id: "d1_q6",
            question: "Rahul and Rohan _______ best friends since childhood.",
            options: ["are", "is", "am", "was"],
            correctAnswer: "are",
            explanation: "Two people (Rahul and Rohan) = plural subject, so we use 'are'.",
            topic: "IS/AM/ARE"
        },
        {
            id: "d1_q7",
            question: "Choose the correct pronoun: 'Pooja is smart. _______ always finishes homework first.'",
            options: ["She", "He", "They", "It"],
            correctAnswer: "She",
            explanation: "Female singular person (Pooja) ke liye pronoun 'She' use hota hai.",
            topic: "PRONOUNS"
        },
        {
            id: "d1_q8",
            question: "Choose the correct pronoun: 'The birds are singing in the tree. _______ look very cheerful.'",
            options: ["They", "He", "She", "It"],
            correctAnswer: "They",
            explanation: "Plural creatures/objects (The birds) ke liye 'They' use hota hai.",
            topic: "PRONOUNS"
        },
        {
            id: "d1_q9",
            question: "Why _______ you late for class yesterday morning?",
            options: ["were", "was", "is", "are"],
            correctAnswer: "were",
            explanation: "'You' ke saath past tense mein hamesha 'were' use hota hai.",
            topic: "WAS/WERE"
        },
        {
            id: "d1_q10",
            question: "This box _______ very heavy; please help me lift it.",
            options: ["is", "am", "are", "were"],
            correctAnswer: "is",
            explanation: "Single object ('This box') ke saath present mein 'is' use hota hai.",
            topic: "IS/AM/ARE"
        }
    ],

    // -------------------------------------------------------------------------
    // DAY 2: HAS / HAVE, WILL HAVE, SINGULAR / PLURAL NOUNS (10 questions)
    // -------------------------------------------------------------------------
    2: [
        {
            id: "d2_q1",
            question: "I _______ two blue pens in my school bag.",
            options: ["have", "has", "having", "had been"],
            correctAnswer: "have",
            explanation: "'I', 'You', 'We', 'They' ke saath possession mein 'have' lagta hai.",
            topic: "HAS/HAVE"
        },
        {
            id: "d2_q2",
            question: "Ravi _______ a new bicycle gifted by his uncle.",
            options: ["has", "have", "are", "having"],
            correctAnswer: "has",
            explanation: "Third person singular (He/She/It/Single name) ke saath 'has' lagta hai.",
            topic: "HAS/HAVE"
        },
        {
            id: "d2_q3",
            question: "They _______ completed all their English worksheets.",
            options: ["have", "has", "is", "was"],
            correctAnswer: "have",
            explanation: "'They' plural subject hai, isliye 'have' use hota hai.",
            topic: "HAS/HAVE"
        },
        {
            id: "d2_q4",
            question: "Tomorrow at 10 AM, we _______ our final English quiz.",
            options: ["will have", "have has", "was having", "has"],
            correctAnswer: "will have",
            explanation: "Future event ('Tomorrow') ke liye 'will have' ka prayog hota hai.",
            topic: "WILL HAVE"
        },
        {
            id: "d2_q5",
            question: "What is the correct plural form of 'child'?",
            options: ["children", "childs", "childrens", "childes"],
            correctAnswer: "children",
            explanation: "'Child' ka irregular plural 'children' hota hai (no 's').",
            topic: "SINGULAR/PLURAL"
        },
        {
            id: "d2_q6",
            question: "The cat caught two _______ in the kitchen yesterday.",
            options: ["mice", "mouses", "mices", "mouse"],
            correctAnswer: "mice",
            explanation: "'Mouse' ka plural form 'mice' hota hai.",
            topic: "SINGULAR/PLURAL"
        },
        {
            id: "d2_q7",
            question: "My father _______ a car, but my brothers _______ bicycles.",
            options: ["has / have", "have / has", "has / has", "have / have"],
            correctAnswer: "has / have",
            explanation: "Father (singular) -> has; Brothers (plural) -> have.",
            topic: "HAS/HAVE"
        },
        {
            id: "d2_q8",
            question: "Identify the plural noun: 'There are five mangoes on the table.'",
            options: ["mangoes", "table", "five", "on"],
            correctAnswer: "mangoes",
            explanation: "'Mangoes' plural noun hai (more than one mango).",
            topic: "SINGULAR/PLURAL"
        },
        {
            id: "d2_q9",
            question: "She _______ already eaten her breakfast before leaving.",
            options: ["has", "have", "having", "is"],
            correctAnswer: "has",
            explanation: "'She' singular subject hai, isliye 'has' aayega.",
            topic: "HAS/HAVE"
        },
        {
            id: "d2_q10",
            question: "By next week, every student _______ their course report.",
            options: ["will have", "has had", "having", "were having"],
            correctAnswer: "will have",
            explanation: "Future time reference ('By next week') ke saath 'will have' use hota hai.",
            topic: "WILL HAVE"
        }
    ],

    // -------------------------------------------------------------------------
    // DAY 3: ARTICLES (A / AN / THE), NOUNS, ADJECTIVES (10 questions)
    // -------------------------------------------------------------------------
    3: [
        {
            id: "d3_q1",
            question: "Vikas wants to become _______ honest police officer.",
            options: ["an", "a", "the", "no article"],
            correctAnswer: "an",
            explanation: "'Honest' ka pronunciation vowel sound 'o' se start hota hai, isliye 'an' lagta hai.",
            topic: "ARTICLES"
        },
        {
            id: "d3_q2",
            question: "She bought _______ umbrella because it was raining heavily.",
            options: ["an", "a", "the", "no article"],
            correctAnswer: "an",
            explanation: "'Umbrella' starts with vowel sound 'uh', so we use 'an'.",
            topic: "ARTICLES"
        },
        {
            id: "d3_q3",
            question: "_______ Sun rises in the East.",
            options: ["The", "A", "An", "One"],
            correctAnswer: "The",
            explanation: "Unique celestial objects (Sun, Moon, Earth) ke aage 'The' lagta hai.",
            topic: "ARTICLES"
        },
        {
            id: "d3_q4",
            question: "Which of the following is a PROPER NOUN?",
            options: ["Delhi", "city", "teacher", "river"],
            correctAnswer: "Delhi",
            explanation: "Delhi ek specific place ka proper name hai (starts with capital letter).",
            topic: "NOUNS"
        },
        {
            id: "d3_q5",
            question: "Which of the following is an ABSTRACT NOUN (emotion/quality)?",
            options: ["Bravery", "Sword", "Soldier", "Horse"],
            correctAnswer: "Bravery",
            explanation: "'Bravery' (veerta) ek quality/feeling hai jise chhua nahi ja sakta.",
            topic: "NOUNS"
        },
        {
            id: "d3_q6",
            question: "In the sentence: 'The swift runner won the gold medal', what is 'swift'?",
            options: ["Adjective", "Noun", "Verb", "Pronoun"],
            correctAnswer: "Adjective",
            explanation: "'Swift' (tez) noun 'runner' ki visheshata bata raha hai, isliye Adjective hai.",
            topic: "ADJECTIVES"
        },
        {
            id: "d3_q7",
            question: "Mount Everest is _______ highest mountain peak in the world.",
            options: ["the", "a", "an", "any"],
            correctAnswer: "the",
            explanation: "Superlative degree ('highest', 'best', 'tallest') ke aage hamesha 'the' lagta hai.",
            topic: "ARTICLES"
        },
        {
            id: "d3_q8",
            question: "He is studying in _______ university in Dehradun.",
            options: ["a", "an", "the", "these"],
            correctAnswer: "a",
            explanation: "'University' ka first sound consonant 'yu' (य) hai, isliye 'a' lagega, 'an' nahi.",
            topic: "ARTICLES"
        },
        {
            id: "d3_q9",
            question: "Identify the adjective in: 'Priya wore a beautiful dress today.'",
            options: ["beautiful", "wore", "dress", "today"],
            correctAnswer: "beautiful",
            explanation: "'Beautiful' (sundar) dress ka varnan kar raha hai.",
            topic: "ADJECTIVES"
        },
        {
            id: "d3_q10",
            question: "I saw _______ one-eyed monkey near the temple.",
            options: ["a", "an", "the", "many"],
            correctAnswer: "a",
            explanation: "'One' consonant sound 'w' (व) se shuru hota hai, isliye 'a' lagega.",
            topic: "ARTICLES"
        }
    ],

    // -------------------------------------------------------------------------
    // DAY 4: PRESENT SIMPLE (POSITIVE / NEGATIVE, HE/SHE/IT + -S) (10 questions)
    // -------------------------------------------------------------------------
    4: [
        {
            id: "d4_q1",
            question: "He _______ to school on foot every morning.",
            options: ["goes", "go", "going", "gone"],
            correctAnswer: "goes",
            explanation: "Present simple mein He/She/It ke saath verb mein '-s' ya '-es' judta hai.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q2",
            question: "They _______ like spicy food.",
            options: ["do not", "does not", "is not", "are not"],
            correctAnswer: "do not",
            explanation: "Plural subject 'They' ke negative present mein 'do not' use hota hai.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q3",
            question: "Rohit _______ his teeth twice every day.",
            options: ["brushes", "brush", "brushing", "brushed"],
            correctAnswer: "brushes",
            explanation: "Single person (Rohit) ke routine action ke liye 'brushes' aayega.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q4",
            question: "She _______ want to participate in the drama competition.",
            options: ["does not", "do not", "is not", "not"],
            correctAnswer: "does not",
            explanation: "Third person singular (She) ke negative sentence mein 'does not' lagta hai.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q5",
            question: "Water _______ at 100 degrees Celsius.",
            options: ["boils", "boil", "boiling", "boiled"],
            correctAnswer: "boils",
            explanation: "Universal truth / scientific fact mein singular subject ke saath verb+s hota hai.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q6",
            question: "_______ you know the answer to this question?",
            options: ["Do", "Does", "Is", "Are"],
            correctAnswer: "Do",
            explanation: "'You' ke saath present question mein 'Do' use hota hai.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q7",
            question: "The teacher _______ all students with great patience.",
            options: ["teaches", "teach", "teaching", "teacher"],
            correctAnswer: "teaches",
            explanation: "The teacher (singular) -> 'teaches' (verb + es).",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q8",
            question: "We _______ live in a big city; we live in a village.",
            options: ["do not", "does not", "are not", "did not"],
            correctAnswer: "do not",
            explanation: "'We' ke saath negative mein 'do not' lagta hai.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q9",
            question: "My mother _______ delicious food every evening.",
            options: ["cooks", "cook", "cooking", "cooked"],
            correctAnswer: "cooks",
            explanation: "'My mother' singular subject hai, isliye 'cooks' aayega.",
            topic: "PRESENT SIMPLE"
        },
        {
            id: "d4_q10",
            question: "Does your friend _______ English fluently?",
            options: ["speak", "speaks", "speaking", "spoke"],
            correctAnswer: "speak",
            explanation: "Jab sentence mein 'Does' aa jata hai, toh main verb base form (V1) mein rehta hai.",
            topic: "PRESENT SIMPLE"
        }
    ],

    // -------------------------------------------------------------------------
    // DAY 5: MIXED GRAMMAR & VERB CORRECTION (10 questions)
    // -------------------------------------------------------------------------
    5: [
        {
            id: "d5_q1",
            question: "Find the incorrect part: 'Yesterday I go (A) to the market (B) with my brother (C).'",
            options: ["go (should be went)", "to the market", "with my brother", "No error"],
            correctAnswer: "go (should be went)",
            explanation: "'Yesterday' past tense darshata hai, isliye 'go' ki jagah 'went' aana chahiye.",
            topic: "VERB CORRECTION"
        },
        {
            id: "d5_q2",
            question: "He _______ TV when I called him last evening.",
            options: ["was watching", "is watching", "were watching", "watches"],
            correctAnswer: "was watching",
            explanation: "Past continuous action: He + was watching.",
            topic: "PAST CONTINUOUS"
        },
        {
            id: "d5_q3",
            question: "Neither Amit nor his friends _______ present in the meeting yesterday.",
            options: ["were", "was", "is", "are"],
            correctAnswer: "were",
            explanation: "In 'Neither...nor', verb closest subject ('friends' - plural) ke anusar hoti hai.",
            topic: "SUBJECT-VERB AGREEMENT"
        },
        {
            id: "d5_q4",
            question: "Choose the correct sentence:",
            options: [
                "She did not write the letter.",
                "She did not wrote the letter.",
                "She does not wrote the letter.",
                "She not write the letter."
            ],
            correctAnswer: "She did not write the letter.",
            explanation: "'Did not' ke baad hamesha verb ki first form (V1 - write) aati hai.",
            topic: "VERB CORRECTION"
        },
        {
            id: "d5_q5",
            question: "The dog wagged _______ tail happily when seeing its master.",
            options: ["its", "it's", "their", "his"],
            correctAnswer: "its",
            explanation: "'its' possession darshata hai. 'it's' ka matlab 'it is' hota hai.",
            topic: "PRONOUNS"
        },
        {
            id: "d5_q6",
            question: "Look! The sun _______ behind the clouds.",
            options: ["is rising", "rises", "was rising", "rose"],
            correctAnswer: "is rising",
            explanation: "'Look!' indicates an action happening right now (Present Continuous).",
            topic: "PRESENT CONTINUOUS"
        },
        {
            id: "d5_q7",
            question: "Select the correctly punctuated sentence:",
            options: [
                "\"Where are you going?\" asked Meena.",
                "\"Where are you going.\" asked Meena.",
                "Where are you going? Asked Meena.",
                "\"Where are you going\", asked Meena?"
            ],
            correctAnswer: "\"Where are you going?\" asked Meena.",
            explanation: "Direct question marks inverted commas ke andar aate hain.",
            topic: "PUNCTUATION"
        },
        {
            id: "d5_q8",
            question: "Each of the students _______ given a certificate of participation.",
            options: ["was", "were", "are", "have"],
            correctAnswer: "was",
            explanation: "'Each' hamesha singular verb ('was') leta hai.",
            topic: "SUBJECT-VERB AGREEMENT"
        },
        {
            id: "d5_q9",
            question: "We should not make _______ noise in the library.",
            options: ["a", "an", "the", "many"],
            correctAnswer: "a",
            explanation: "Idiomatically, we say 'make a noise'.",
            topic: "ARTICLES"
        },
        {
            id: "d5_q10",
            question: "She is _______ than her elder sister.",
            options: ["taller", "tall", "tallest", "more tall"],
            correctAnswer: "taller",
            explanation: "Comparative degree ('than') ke saath 'taller' use hota hai.",
            topic: "ADJECTIVES"
        }
    ],

    // -------------------------------------------------------------------------
    // DAY 6: CUMULATIVE REVISION (DRAWN FROM ALL TOPICS) (10 questions)
    // -------------------------------------------------------------------------
    6: [
        {
            id: "d6_q1",
            question: "Yesterday afternoon, I _______ an apple and drank milk.",
            options: ["ate", "eat", "eats", "eating"],
            correctAnswer: "ate",
            explanation: "Past tense action ('Yesterday') ke liye V2 'ate' aayega.",
            topic: "CUMULATIVE - PAST VERB"
        },
        {
            id: "d6_q2",
            question: "He _______ not come to school tomorrow because of fever.",
            options: ["will", "was", "did", "are"],
            correctAnswer: "will",
            explanation: "Future negative prediction: 'will not come'.",
            topic: "CUMULATIVE - FUTURE"
        },
        {
            id: "d6_q3",
            question: "Gita and Sita _______ preparing for the annual exam together.",
            options: ["are", "is", "am", "was"],
            correctAnswer: "are",
            explanation: "Plural subject (Gita and Sita) -> 'are'.",
            topic: "CUMULATIVE - IS/ARE"
        },
        {
            id: "d6_q4",
            question: "An honest man _______ speaks a lie.",
            options: ["never", "always", "every", "did"],
            correctAnswer: "never",
            explanation: "Sensible meaning: Sacha vyakti kabhi jhooth nahi bolta ('never').",
            topic: "CUMULATIVE - VOCAB & GRAMMAR"
        },
        {
            id: "d6_q5",
            question: "Choose the correct article: 'Ramesh is _______ European citizen.'",
            options: ["a", "an", "the", "no article"],
            correctAnswer: "a",
            explanation: "'European' starts with sound 'yu' (consonant), so we use 'a', not 'an'.",
            topic: "CUMULATIVE - ARTICLES"
        },
        {
            id: "d6_q6",
            question: "Why _______ you crying when the teacher entered the classroom?",
            options: ["were", "was", "are", "is"],
            correctAnswer: "were",
            explanation: "'You' ke saath past continuous question mein 'were' lagta hai.",
            topic: "CUMULATIVE - WAS/WERE"
        },
        {
            id: "d6_q7",
            question: "They _______ already finished their project work.",
            options: ["have", "has", "is", "was"],
            correctAnswer: "have",
            explanation: "They (plural) + have + V3 (finished).",
            topic: "CUMULATIVE - HAS/HAVE"
        },
        {
            id: "d6_q8",
            question: "Which word is the PAST FORM (V2) of 'write'?",
            options: ["wrote", "written", "writes", "writing"],
            correctAnswer: "wrote",
            explanation: "V1 = write, V2 = wrote, V3 = written.",
            topic: "CUMULATIVE - VERB FORMS"
        },
        {
            id: "d6_q9",
            question: "My father _______ up at 5:00 AM every single morning.",
            options: ["wakes", "wake", "woke", "waking"],
            correctAnswer: "wakes",
            explanation: "Father (singular) + daily routine -> 'wakes'.",
            topic: "CUMULATIVE - PRESENT SIMPLE"
        },
        {
            id: "d6_q10",
            question: "The boy who _______ the race was awarded a gold medal.",
            options: ["won", "win", "wins", "winning"],
            correctAnswer: "won",
            explanation: "Past event ('was awarded') ke relative clause mein V2 'won' lagta hai.",
            topic: "CUMULATIVE - PAST TENSE"
        }
    ]
};

export function getGrammarQuestionsForDay(day: number): GrammarQuestion[] {
    return GRAMMAR_QUESTIONS[day] || GRAMMAR_QUESTIONS[1];
}
