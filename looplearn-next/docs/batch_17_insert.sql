-- Science Questions Batch 17 - Insertion SQL
-- Chapter: Our Home: Earth, a Unique Life Sustaining Planet (Class 8)
-- Generated: 2026-02-25T06:32:16.039Z
-- Run this in your Supabase SQL Editor

-- Question 1: Which layer of the Earth, where all life exists, i...
DO $$
DECLARE
  q_id_1 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which layer of the Earth, where all life exists, is compared to the thin skin of an apple?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'The Earth''s crust is the extremely thin outermost layer where all life, from the tallest mountains to the deepest oceans, exists.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_1;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_1, 'Mantle', 1, false, ''),
    (q_id_1, 'Outer Core', 2, false, ''),
    (q_id_1, 'Crust', 3, true, ''),
    (q_id_1, 'Inner Core', 4, false, '');
END $$;

-- Question 2: Which gas is primarily responsible for the high te...
DO $$
DECLARE
  q_id_2 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which gas is primarily responsible for the high temperature of Venus, making it hotter than Mercury?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Venus has a thick atmosphere almost entirely made of carbon dioxide, which traps heat through the greenhouse effect.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_2;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_2, 'Oxygen', 1, false, ''),
    (q_id_2, 'Carbon Dioxide', 2, true, ''),
    (q_id_2, 'Nitrogen', 3, false, ''),
    (q_id_2, 'Hydrogen', 4, false, '');
END $$;

-- Question 3: The range of distances from a star where water can...
DO $$
DECLARE
  q_id_3 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The range of distances from a star where water can remain in liquid form is known as the:',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'The habitable zone, or Goldilocks zone, is the region where temperatures are ''just right'' for liquid water to exist.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_3;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_3, 'Frozen Zone', 1, false, ''),
    (q_id_3, 'Ozone Layer', 2, false, ''),
    (q_id_3, 'Habitable Zone', 3, true, ''),
    (q_id_3, 'Magnetic Field', 4, false, '');
END $$;

-- Question 4: What would likely happen if the Earth were much sm...
DO $$
DECLARE
  q_id_4 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What would likely happen if the Earth were much smaller in size with the same density?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'hard',
    10,
    true,
    'If Earth were smaller, its gravity would be too weak to hold onto the gases in our atmosphere.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_4;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_4, 'Gravity would be too strong', 1, false, ''),
    (q_id_4, 'The atmosphere would escape into space', 2, true, ''),
    (q_id_4, 'Water would always be frozen', 3, false, ''),
    (q_id_4, 'Bones would get crushed', 4, false, '');
END $$;

-- Question 5: Which layer of the atmosphere acts as a shield by ...
DO $$
DECLARE
  q_id_5 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which layer of the atmosphere acts as a shield by blocking harmful ultraviolet (UV) rays?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'The ozone layer, a form of oxygen, blocks harmful UV rays that can damage living cells.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_5;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_5, 'Hydrosphere', 1, false, ''),
    (q_id_5, 'Ozone layer', 2, true, ''),
    (q_id_5, 'Geosphere', 3, false, ''),
    (q_id_5, 'Crust', 4, false, '');
END $$;

-- Question 6: Earth's magnetic field is believed to originate fr...
DO $$
DECLARE
  q_id_6 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Earth''s magnetic field is believed to originate from the movement of molten iron in its:',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'The movement of molten iron in Earth''s core is believed to be the origin of its magnetic field.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_6;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_6, 'Atmosphere', 1, false, ''),
    (q_id_6, 'Crust', 2, false, ''),
    (q_id_6, 'Core', 3, true, ''),
    (q_id_6, 'Mantle', 4, false, '');
END $$;

-- Question 7: Which term describes the collective non-living par...
DO $$
DECLARE
  q_id_7 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which term describes the collective non-living parts of Earth, including rocks, soil, and minerals?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'The geosphere refers to the solid parts of the Earth, such as rocks, soil, and minerals.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_7;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_7, 'Biosphere', 1, false, ''),
    (q_id_7, 'Hydrosphere', 2, false, ''),
    (q_id_7, 'Atmosphere', 3, false, ''),
    (q_id_7, 'Geosphere', 4, true, '');
END $$;

-- Question 8: What is 'geodiversity'?...
DO $$
DECLARE
  q_id_8 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What is ''geodiversity''?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Geodiversity is the variety of landforms, rocks, and soils, and the processes that shape them.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_8;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_8, 'The variety of living animals', 1, false, ''),
    (q_id_8, 'The variety of landforms, rocks, and soils', 2, true, ''),
    (q_id_8, 'The distance of Earth from the Sun', 3, false, ''),
    (q_id_8, 'The different layers of the atmosphere', 4, false, '');
END $$;

-- Question 9: Reproduction ensures the continuity of life by pas...
DO $$
DECLARE
  q_id_9 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Reproduction ensures the continuity of life by passing on instructions stored in cells called:',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'Genetic material or genes act as a detailed instruction manual inside every cell, passed from parents to offspring.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_9;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_9, 'Enzymes', 1, false, ''),
    (q_id_9, 'Hormones', 2, false, ''),
    (q_id_9, 'Genes', 3, true, ''),
    (q_id_9, 'Minerals', 4, false, '');
END $$;

-- Question 10: In which type of reproduction does a single parent...
DO $$
DECLARE
  q_id_10 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'In which type of reproduction does a single parent produce an exact copy of itself?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'Asexual reproduction involves a single parent producing offspring that are exact copies of the parent.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_10;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_10, 'Sexual reproduction', 1, false, ''),
    (q_id_10, 'Asexual reproduction', 2, true, ''),
    (q_id_10, 'Fertilisation', 3, false, ''),
    (q_id_10, 'Pollination', 4, false, '');
END $$;

-- Question 11: What are the specialized reproductive cells that c...
DO $$
DECLARE
  q_id_11 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What are the specialized reproductive cells that carry only half of the parent''s genetic material?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Gametes are specialized cells produced by each parent that carry half the genetic set, preventing doubling in every generation.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_11;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_11, 'Zygotes', 1, false, ''),
    (q_id_11, 'Embryos', 2, false, ''),
    (q_id_11, 'Gametes', 3, true, ''),
    (q_id_11, 'Buds', 4, false, '');
END $$;

-- Question 12: Which of the following describes vegetative propag...
DO $$
DECLARE
  q_id_12 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following describes vegetative propagation?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Vegetative propagation is a form of asexual reproduction where new plants grow from parts like leaves, stems, or roots.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_12;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_12, 'Reproduction through seeds', 1, false, ''),
    (q_id_12, 'Reproduction through spores', 2, false, ''),
    (q_id_12, 'Reproduction using plant parts like leaf or stem', 3, true, ''),
    (q_id_12, 'Reproduction involving two parents', 4, false, '');
END $$;

-- Question 13: Amoeba and bacteria reproduce by dividing into two...
DO $$
DECLARE
  q_id_13 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Amoeba and bacteria reproduce by dividing into two identical individuals. This is called:',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'Single-celled organisms like bacteria and amoebae divide into two identical individuals as a form of asexual reproduction.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_13;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_13, 'Budding', 1, false, ''),
    (q_id_13, 'Regeneration', 2, false, ''),
    (q_id_13, 'Asexual division', 3, true, ''),
    (q_id_13, 'Fertilisation', 4, false, '');
END $$;

-- Question 14: In flowering plants, the male gametes are found in...
DO $$
DECLARE
  q_id_14 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'In flowering plants, the male gametes are found inside the:',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Pollen grains found inside the anther are the male gametes in flowering plants.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_14;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_14, 'Ovule', 1, false, ''),
    (q_id_14, 'Anther', 2, true, ''),
    (q_id_14, 'Fruit', 3, false, ''),
    (q_id_14, 'Root', 4, false, '');
END $$;

-- Question 15: What is formed when male and female gametes combin...
DO $$
DECLARE
  q_id_15 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What is formed when male and female gametes combine during fertilisation?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'Fertilisation results in a single cell called a zygote, which then develops into an embryo.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_15;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_15, 'Pollen', 1, false, ''),
    (q_id_15, 'Zygote', 2, true, ''),
    (q_id_15, 'Gamete', 3, false, ''),
    (q_id_15, 'Bud', 4, false, '');
END $$;

-- Question 16: In which group of animals does the zygote typicall...
DO $$
DECLARE
  q_id_16 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'In which group of animals does the zygote typically develop into an embryo inside the mother''s body?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'In most mammals, the mother''s body provides food and oxygen as the zygote develops into an embryo internally.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_16;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_16, 'Birds', 1, false, ''),
    (q_id_16, 'Fish', 2, false, ''),
    (q_id_16, 'Mammals', 3, true, ''),
    (q_id_16, 'Frogs', 4, false, '');
END $$;

-- Question 17: The 'triple planetary crisis' refers to which thre...
DO $$
DECLARE
  q_id_17 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The ''triple planetary crisis'' refers to which three environmental challenges?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'hard',
    10,
    true,
    'Climate change, biodiversity loss, and pollution are together known as the triple planetary crisis.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_17;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_17, 'Overpopulation, Food shortage, War', 1, false, ''),
    (q_id_17, 'Climate change, Biodiversity loss, Pollution', 2, true, ''),
    (q_id_17, 'Global warming, Acid rain, Earthquakes', 3, false, ''),
    (q_id_17, 'Volcanoes, Floods, Droughts', 4, false, '');
END $$;

-- Question 18: Why does burning fossil fuels cause the Earth to h...
DO $$
DECLARE
  q_id_18 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Why does burning fossil fuels cause the Earth to heat up?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Burning fossil fuels releases stored carbon as greenhouse gases like carbon dioxide, which trap heat faster than nature can absorb it.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_18;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_18, 'It releases oxygen that traps heat', 1, false, ''),
    (q_id_18, 'It destroys the Earth''s core', 2, false, ''),
    (q_id_18, 'It releases extra carbon dioxide that traps heat', 3, true, ''),
    (q_id_18, 'It makes the Sun shine brighter', 4, false, '');
END $$;

-- Question 19: The ISRO mission 'Mangalyaan' was launched to expl...
DO $$
DECLARE
  q_id_19 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The ISRO mission ''Mangalyaan'' was launched to explore which planet?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'Mangalyaan (Mars Orbiter Mission) was launched by ISRO in 2013 to study Mars'' atmosphere and surface.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_19;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_19, 'Venus', 1, false, ''),
    (q_id_19, 'Jupiter', 2, false, ''),
    (q_id_19, 'Mars', 3, true, ''),
    (q_id_19, 'Saturn', 4, false, '');
END $$;

-- Question 20: What helps the Earth look blue when seen from spac...
DO $$
DECLARE
  q_id_20 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What helps the Earth look blue when seen from space?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'Earth is called the ''Blue Planet'' because water covers approximately 70% of its surface.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_20;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_20, 'Lush forests', 1, false, ''),
    (q_id_20, 'The vast amount of water', 2, true, ''),
    (q_id_20, 'The thin crust', 3, false, ''),
    (q_id_20, 'The ozone layer', 4, false, '');
END $$;

-- Question 21: Which animal is mentioned as being able to regrow ...
DO $$
DECLARE
  q_id_21 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which animal is mentioned as being able to regrow from a small piece of its body?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Planaria is a type of flatworm that can regrow entirely from just a fragment of its body.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_21;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_21, 'Cow', 1, false, ''),
    (q_id_21, 'Hydra', 2, false, ''),
    (q_id_21, 'Planaria', 3, true, ''),
    (q_id_21, 'Fish', 4, false, '');
END $$;

-- Question 22: What protects the Earth from harmful cosmic rays a...
DO $$
DECLARE
  q_id_22 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What protects the Earth from harmful cosmic rays and solar winds?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'Earth''s magnetic field acts as a protective shield, pushing away harmful high-energy particles like solar winds.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_22;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_22, 'The Moon', 1, false, ''),
    (q_id_22, 'The Magnetic Field', 2, true, ''),
    (q_id_22, 'The Hydrosphere', 3, false, ''),
    (q_id_22, 'Mountains', 4, false, '');
END $$;

-- Question 23: Which planet in our solar system has an atmosphere...
DO $$
DECLARE
  q_id_23 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which planet in our solar system has an atmosphere 100 times thinner than Earth?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'hard',
    10,
    true,
    'The atmosphere on Mars is 100 times thinner than Earth''s, making it less suitable for sustaining most life.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_23;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_23, 'Venus', 1, false, ''),
    (q_id_23, 'Jupiter', 2, false, ''),
    (q_id_23, 'Mars', 3, true, ''),
    (q_id_23, 'Mercury', 4, false, '');
END $$;

-- Question 24: Pollination is the process of carrying:...
DO $$
DECLARE
  q_id_24 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Pollination is the process of carrying:',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'easy',
    10,
    true,
    'Pollination is the transfer of pollen from the anther to the female parts of a flower.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_24;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_24, 'Water to roots', 1, false, ''),
    (q_id_24, 'Seeds to soil', 2, false, ''),
    (q_id_24, 'Pollen to another flower', 3, true, ''),
    (q_id_24, 'Oxygen to the air', 4, false, '');
END $$;

-- Question 25: What role does the 'biosphere' play on Earth?...
DO $$
DECLARE
  q_id_25 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What role does the ''biosphere'' play on Earth?',
    'mcq',
    8,
    'science',
    'Our Home: Earth, a Unique Life Sustaining Planet',
    'medium',
    10,
    true,
    'The biosphere includes land, water, and air where life interacts with the environment to survive.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_25;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_25, 'It consists of only the air', 1, false, ''),
    (q_id_25, 'It includes all living beings and their living places', 2, true, ''),
    (q_id_25, 'It is the study of rocks only', 3, false, ''),
    (q_id_25, 'It protects the Earth from gravity', 4, false, '');
END $$;

