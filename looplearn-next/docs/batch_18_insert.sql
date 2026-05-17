-- Science Questions Batch 18 - Insertion SQL
-- Generated: 2026-02-25T07:09:47.252Z
-- Run this in your Supabase SQL Editor

-- Question 1: Pressure is defined as the force acting per unit _...
DO $$
DECLARE
  q_id_1 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Pressure is defined as the force acting per unit ________ of a surface.',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'easy',
    10,
    true,
    'Pressure is the ratio of force to the area over which it is applied (P = F/A).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_1;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_1, 'Volume', 1, false, ''),
    (q_id_1, 'Area', 2, true, ''),
    (q_id_1, 'Length', 3, false, ''),
    (q_id_1, 'Mass', 4, false, '');
END $$;

-- Question 2: Why do school bags often have wide straps instead ...
DO $$
DECLARE
  q_id_2 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Why do school bags often have wide straps instead of thin strings?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'A larger area (wide straps) reduces the pressure exerted by the weight of the bag on the shoulders, making it more comfortable to carry.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_2;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_2, 'To increase the force', 1, false, ''),
    (q_id_2, 'To decrease the pressure on shoulders', 2, true, ''),
    (q_id_2, 'To make the bag look bigger', 3, false, ''),
    (q_id_2, 'To increase the pressure', 4, false, '');
END $$;

-- Question 3: Which of the following statements about air pressu...
DO $$
DECLARE
  q_id_3 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following statements about air pressure is correct?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'Air particles move in all directions and collide with surfaces, exerting pressure equally in all directions.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_3;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_3, 'Air exerts pressure only downwards', 1, false, ''),
    (q_id_3, 'Air exerts pressure in all directions', 2, true, ''),
    (q_id_3, 'Air pressure increases with altitude', 3, false, ''),
    (q_id_3, 'Air pressure is highest at the top of a mountain', 4, false, '');
END $$;

-- Question 4: What happens to the pressure of air when its speed...
DO $$
DECLARE
  q_id_4 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What happens to the pressure of air when its speed increases?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'hard',
    10,
    true,
    'According to Bernoulli''s principle, an increase in the speed of a fluid (like air) is accompanied by a decrease in pressure.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_4;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_4, 'Pressure increases', 1, false, ''),
    (q_id_4, 'Pressure remains same', 2, false, ''),
    (q_id_4, 'Pressure decreases', 3, true, ''),
    (q_id_4, 'Pressure becomes zero', 4, false, '');
END $$;

-- Question 5: High-speed winds blowing over the roof of a hut ca...
DO $$
DECLARE
  q_id_5 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'High-speed winds blowing over the roof of a hut can lift the roof because:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'hard',
    10,
    true,
    'Fast wind over the roof reduces pressure above it. The higher pressure inside the hut then pushes the roof upwards.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_5;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_5, 'High speed increases air pressure on top', 1, false, ''),
    (q_id_5, 'High speed creates low pressure on top', 2, true, ''),
    (q_id_5, 'The roof becomes lighter', 3, false, ''),
    (q_id_5, 'The wind pushes the roof down', 4, false, '');
END $$;

-- Question 6: Air moves from a region of __________ pressure to ...
DO $$
DECLARE
  q_id_6 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Air moves from a region of __________ pressure to a region of __________ pressure.',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'easy',
    10,
    true,
    'The difference in air pressure causes air to flow from areas where it is more concentrated (high pressure) to where it is less concentrated (low pressure).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_6;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_6, 'Low, High', 1, false, ''),
    (q_id_6, 'High, Low', 2, true, ''),
    (q_id_6, 'Low, Zero', 3, false, ''),
    (q_id_6, 'High, High', 4, false, '');
END $$;

-- Question 7: On heating, air __________ and becomes __________....
DO $$
DECLARE
  q_id_7 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'On heating, air __________ and becomes __________.',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'When air is heated, its particles move faster and spread out (expand), making it less dense and lighter than cold air.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_7;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_7, 'Contracts, Heavier', 1, false, ''),
    (q_id_7, 'Expands, Lighter', 2, true, ''),
    (q_id_7, 'Expands, Heavier', 3, false, ''),
    (q_id_7, 'Contracts, Lighter', 4, false, '');
END $$;

-- Question 8: Which instrument is used to measure wind speed?...
DO $$
DECLARE
  q_id_8 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which instrument is used to measure wind speed?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'easy',
    10,
    true,
    'An anemometer is a device used for measuring the speed and direction of the wind.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_8;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_8, 'Barometer', 1, false, ''),
    (q_id_8, 'Thermometer', 2, false, ''),
    (q_id_8, 'Anemometer', 3, true, ''),
    (q_id_8, 'Manometer', 4, false, '');
END $$;

-- Question 9: A balloon expands when we blow air into it because...
DO $$
DECLARE
  q_id_9 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A balloon expands when we blow air into it because:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'easy',
    10,
    true,
    'Adding more air particles increases collisions with the inner walls, creating internal pressure that stretches the balloon.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_9;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_9, 'The rubber becomes thin', 1, false, ''),
    (q_id_9, 'Air inside exerts pressure on the walls', 2, true, ''),
    (q_id_9, 'The temperature inside rises', 3, false, ''),
    (q_id_9, 'The air outside pushes it', 4, false, '');
END $$;

-- Question 10: What is the primary cause of wind circulation on E...
DO $$
DECLARE
  q_id_10 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What is the primary cause of wind circulation on Earth?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'Uneven heating between the equator and poles, and between land and water, creates pressure differences that drive wind.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_10;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_10, 'Earth''s gravity', 1, false, ''),
    (q_id_10, 'Uneven heating of the Earth by the Sun', 2, true, ''),
    (q_id_10, 'The Moon''s phases', 3, false, ''),
    (q_id_10, 'The depth of the oceans', 4, false, '');
END $$;

-- Question 11: During the day in coastal areas, wind usually blow...
DO $$
DECLARE
  q_id_11 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'During the day in coastal areas, wind usually blows from:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'Land heats up faster than water; the hot air over land rises, creating low pressure that draws in cooler air from the sea (Sea Breeze).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_11;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_11, 'Land to Sea', 1, false, ''),
    (q_id_11, 'Sea to Land', 2, true, ''),
    (q_id_11, 'South to North', 3, false, ''),
    (q_id_11, 'Mountains to Plains', 4, false, '');
END $$;

-- Question 12: Which of the following is a characteristic of a th...
DO $$
DECLARE
  q_id_12 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is a characteristic of a thunderstorm?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'Thunderstorms develop in hot, humid tropical areas where rising warm air carries water droplets that freeze and fall, creating lightning and sound.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_12;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_12, 'Calm winds and bright sun', 1, false, ''),
    (q_id_12, 'Heavy rain, lightning, and thunder', 2, true, ''),
    (q_id_12, 'Snowfall without wind', 3, false, ''),
    (q_id_12, 'A dry heatwave', 4, false, '');
END $$;

-- Question 13: The center of a cyclone is a calm area called the:...
DO $$
DECLARE
  q_id_13 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The center of a cyclone is a calm area called the:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'easy',
    10,
    true,
    'The ''eye'' of a cyclone is a low-pressure area with very light winds and clear skies, surrounded by high-speed rotating winds.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_13;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_13, 'Head', 1, false, ''),
    (q_id_13, 'Tail', 2, false, ''),
    (q_id_13, 'Eye', 3, true, ''),
    (q_id_13, 'Core', 4, false, '');
END $$;

-- Question 14: Cyclones are known as __________ in the American c...
DO $$
DECLARE
  q_id_14 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Cyclones are known as __________ in the American continent.',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'While they are the same weather phenomenon, they are called Hurricanes in the Atlantic and Typhoons in the Pacific.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_14;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_14, 'Typhoons', 1, false, ''),
    (q_id_14, 'Hurricanes', 2, true, ''),
    (q_id_14, 'Tornadoes', 3, false, ''),
    (q_id_14, 'Cyclones', 4, false, '');
END $$;

-- Question 15: A dark funnel-shaped cloud that reaches from the s...
DO $$
DECLARE
  q_id_15 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A dark funnel-shaped cloud that reaches from the sky to the ground is a:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'easy',
    10,
    true,
    'Tornadoes are violent, rotating columns of air that descend from thunderstorms to the ground.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_15;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_15, 'Monsoon', 1, false, ''),
    (q_id_15, 'Cyclone', 2, false, ''),
    (q_id_15, 'Tornado', 3, true, ''),
    (q_id_15, 'Thunderstorm', 4, false, '');
END $$;

-- Question 16: Why are holes made in banners and hoardings hangin...
DO $$
DECLARE
  q_id_16 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Why are holes made in banners and hoardings hanging in the open?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'hard',
    10,
    true,
    'Holes allow air to pass through the banner, reducing the force/pressure exerted by the wind so the banner doesn''t tear or fall.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_16;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_16, 'To make them look decorative', 1, false, ''),
    (q_id_16, 'To let light pass through', 2, false, ''),
    (q_id_16, 'To reduce the air pressure exerted by the wind', 3, true, ''),
    (q_id_16, 'To save material', 4, false, '');
END $$;

-- Question 17: If you blow air between two hanging balloons, they...
DO $$
DECLARE
  q_id_17 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'If you blow air between two hanging balloons, they will:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'hard',
    10,
    true,
    'Blowing air between them creates a region of low pressure; the higher pressure on the outside pushes the balloons toward each other.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_17;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_17, 'Move away from each other', 1, false, ''),
    (q_id_17, 'Move towards each other', 2, true, ''),
    (q_id_17, 'Stay stationary', 3, false, ''),
    (q_id_17, 'Burst immediately', 4, false, '');
END $$;

-- Question 18: Thunder is caused by:...
DO $$
DECLARE
  q_id_18 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Thunder is caused by:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'Lightning heats the surrounding air so fast that it expands explosively, creating the sound wave we call thunder.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_18;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_18, 'Clouds hitting each other', 1, false, ''),
    (q_id_18, 'The rapid expansion of air heated by lightning', 2, true, ''),
    (q_id_18, 'Rain falling on the ground', 3, false, ''),
    (q_id_18, 'Wind blowing through trees', 4, false, '');
END $$;

-- Question 19: During a thunderstorm, it is safest to take shelte...
DO $$
DECLARE
  q_id_19 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'During a thunderstorm, it is safest to take shelter in:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'easy',
    10,
    true,
    'Buildings and cars (acting as Faraday cages) protect you from lightning, whereas tall objects or open spaces increase risk.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_19;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_19, 'An open field', 1, false, ''),
    (q_id_19, 'Under a tall isolated tree', 2, false, ''),
    (q_id_19, 'Inside a car or a building', 3, true, ''),
    (q_id_19, 'Under an umbrella with a metal handle', 4, false, '');
END $$;

-- Question 20: The 'Standard Unit' (SI) of pressure is:...
DO $$
DECLARE
  q_id_20 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The ''Standard Unit'' (SI) of pressure is:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'One Pascal (Pa) is equal to one Newton per square meter (N/m²).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_20;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_20, 'Newton', 1, false, ''),
    (q_id_20, 'Pascal', 2, true, ''),
    (q_id_20, 'Joule', 3, false, ''),
    (q_id_20, 'Watt', 4, false, '');
END $$;

-- Question 21: What is the direction of wind during the 'Winter M...
DO $$
DECLARE
  q_id_21 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What is the direction of wind during the ''Winter Monsoon'' in India?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'hard',
    10,
    true,
    'In winter, land cools faster than the sea. High pressure over land pushes dry winds toward the low pressure over the sea.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_21;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_21, 'Sea to Land', 1, false, ''),
    (q_id_21, 'Land to Sea', 2, true, ''),
    (q_id_21, 'South to North', 3, false, ''),
    (q_id_21, 'West to East', 4, false, '');
END $$;

-- Question 22: If a force of 100 N is applied to an area of 2 m²,...
DO $$
DECLARE
  q_id_22 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'If a force of 100 N is applied to an area of 2 m², the pressure is:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'Pressure = Force / Area = 100 N / 2 m² = 50 Pa.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_22;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_22, '200 Pa', 1, false, ''),
    (q_id_22, '50 Pa', 2, true, ''),
    (q_id_22, '100 Pa', 3, false, ''),
    (q_id_22, '25 Pa', 4, false, '');
END $$;

-- Question 23: What provides the energy for the formation of a cy...
DO $$
DECLARE
  q_id_23 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What provides the energy for the formation of a cyclone?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'hard',
    10,
    true,
    'When water vapor changes back to liquid (rain), it releases heat into the atmosphere, which warms the air and fuels the cyclone''s rotation.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_23;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_23, 'The Earth''s rotation', 1, false, ''),
    (q_id_23, 'Heat released when water vapor condenses into rain', 2, true, ''),
    (q_id_23, 'The friction of wind on land', 3, false, ''),
    (q_id_23, 'Magnetic fields', 4, false, '');
END $$;

-- Question 24: Which coast of India is more vulnerable to cyclone...
DO $$
DECLARE
  q_id_24 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which coast of India is more vulnerable to cyclones?',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'The East Coast (Bay of Bengal) is generally more prone to frequent and intense cyclones compared to the West Coast.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_24;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_24, 'West Coast', 1, false, ''),
    (q_id_24, 'East Coast', 2, true, ''),
    (q_id_24, 'Northern Coast', 3, false, ''),
    (q_id_24, 'Western Ghats', 4, false, '');
END $$;

-- Question 25: A person standing in the 'Eye' of a cyclone would ...
DO $$
DECLARE
  q_id_25 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A person standing in the ''Eye'' of a cyclone would experience:',
    'mcq',
    8,
    'science',
    'Pressure, Winds, Storms, and Cyclones',
    'medium',
    10,
    true,
    'The eye is a low-pressure region of sinking air, which suppresses cloud formation and wind, creating a brief ''calm before the storm'' effect.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_25;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_25, 'Violent winds and heavy rain', 1, false, ''),
    (q_id_25, 'Calm weather and clear sky', 2, true, ''),
    (q_id_25, 'Freezing temperatures', 3, false, ''),
    (q_id_25, 'Dust storms', 4, false, '');
END $$;

-- Question 26: Which of the following is the fundamental idea of ...
DO $$
DECLARE
  q_id_26 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is the fundamental idea of the particulate nature of matter?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'Matter is not a continuous block; it is composed of very small particles with spaces between them.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_26;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_26, 'Matter is continuous like a sheet of glass', 1, false, ''),
    (q_id_26, 'Matter is made up of tiny, discrete particles', 2, true, ''),
    (q_id_26, 'Matter is only made of air and water', 3, false, ''),
    (q_id_26, 'Matter has no empty spaces', 4, false, '');
END $$;

-- Question 27: In which state of matter are the particles packed ...
DO $$
DECLARE
  q_id_27 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'In which state of matter are the particles packed most closely together in a fixed, regular pattern?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'In solids, particles are closely packed with very strong forces of attraction, giving them a fixed shape.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_27;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_27, 'Liquid', 1, false, ''),
    (q_id_27, 'Gas', 2, false, ''),
    (q_id_27, 'Solid', 3, true, ''),
    (q_id_27, 'Plasma', 4, false, '');
END $$;

-- Question 28: What happens to the movement of particles when the...
DO $$
DECLARE
  q_id_28 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What happens to the movement of particles when the temperature of a substance increases?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Increasing temperature adds energy to the particles, causing them to move or vibrate more rapidly.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_28;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_28, 'Particles stop moving', 1, false, ''),
    (q_id_28, 'Particles move slower', 2, false, ''),
    (q_id_28, 'Particles move faster', 3, true, ''),
    (q_id_28, 'Particles become larger', 4, false, '');
END $$;

-- Question 29: The smell of hot sizzling food reaches you several...
DO $$
DECLARE
  q_id_29 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The smell of hot sizzling food reaches you several metres away, but to get the smell from cold food you have to go close. This is due to:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Diffusion is the intermixing of particles. At higher temperatures, particles move faster and diffuse more quickly into the air.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_29;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_29, 'Evaporation', 1, false, ''),
    (q_id_29, 'Diffusion', 2, true, ''),
    (q_id_29, 'Condensation', 3, false, ''),
    (q_id_29, 'Sublimation', 4, false, '');
END $$;

-- Question 30: Which state of matter is highly compressible?...
DO $$
DECLARE
  q_id_30 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which state of matter is highly compressible?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'Gases have large spaces between particles, allowing them to be easily pushed closer together under pressure.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_30;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_30, 'Solid', 1, false, ''),
    (q_id_30, 'Liquid', 2, false, ''),
    (q_id_30, 'Gas', 3, true, ''),
    (q_id_30, 'Metal', 4, false, '');
END $$;

-- Question 31: When a crystal of potassium permanganate is placed...
DO $$
DECLARE
  q_id_31 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'When a crystal of potassium permanganate is placed in water, the purple colour spreads throughout. This proves that:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'The spreading of color occurs because the particles of both the crystal and the water are in constant random motion.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_31;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_31, 'Water is purple', 1, false, ''),
    (q_id_31, 'Particles of matter are constantly moving', 2, true, ''),
    (q_id_31, 'Potassium permanganate is a liquid', 3, false, ''),
    (q_id_31, 'Water particles are stationary', 4, false, '');
END $$;

-- Question 32: The force of attraction between particles is weake...
DO $$
DECLARE
  q_id_32 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The force of attraction between particles is weakest in:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'Oxygen is a gas. In gases, the forces of attraction between particles are negligible compared to liquids and solids.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_32;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_32, 'Oxygen', 1, true, ''),
    (q_id_32, 'Water', 2, false, ''),
    (q_id_32, 'Iron', 3, false, ''),
    (q_id_32, 'Sugar', 4, false, '');
END $$;

-- Question 33: Which of the following describes the 'Liquid' stat...
DO $$
DECLARE
  q_id_33 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following describes the ''Liquid'' state?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Liquids take the shape of the container they are in, but their volume remains constant because particles stay close together.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_33;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_33, 'Fixed shape and fixed volume', 1, false, ''),
    (q_id_33, 'No fixed shape but fixed volume', 2, true, ''),
    (q_id_33, 'Fixed shape but no fixed volume', 3, false, ''),
    (q_id_33, 'No fixed shape and no fixed volume', 4, false, '');
END $$;

-- Question 34: What occupies the 'empty space' between particles ...
DO $$
DECLARE
  q_id_34 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What occupies the ''empty space'' between particles in a gas?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'hard',
    10,
    true,
    'The space between the fundamental particles of a pure substance is empty (void/vacuum).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_34;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_34, 'Air', 1, false, ''),
    (q_id_34, 'Nothing (Vacuum)', 2, true, ''),
    (q_id_34, 'Dust', 3, false, ''),
    (q_id_34, 'Energy', 4, false, '');
END $$;

-- Question 35: Brownian motion describes:...
DO $$
DECLARE
  q_id_35 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Brownian motion describes:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Brownian motion is the random, irregular movement of small particles (like pollen or dust) suspended in a fluid, caused by collisions with molecules.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_35;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_35, 'The regular pattern of solids', 1, false, ''),
    (q_id_35, 'The zig-zag random motion of particles', 2, true, ''),
    (q_id_35, 'The freezing of water', 3, false, ''),
    (q_id_35, 'The weight of a gas', 4, false, '');
END $$;

-- Question 36: If you compress a gas in a syringe, what decreases...
DO $$
DECLARE
  q_id_36 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'If you compress a gas in a syringe, what decreases?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Compression brings the particles closer together, thereby reducing the empty space between them.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_36;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_36, 'The mass of the particles', 1, false, ''),
    (q_id_36, 'The size of individual particles', 2, false, ''),
    (q_id_36, 'The space between particles', 3, true, ''),
    (q_id_36, 'The number of particles', 4, false, '');
END $$;

-- Question 37: A balloon expands when you blow air into it becaus...
DO $$
DECLARE
  q_id_37 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A balloon expands when you blow air into it because:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Moving air particles collide with the inner walls of the balloon, exerting pressure that pushes the walls outward.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_37;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_37, 'Air particles take up space and collide with the walls', 1, true, ''),
    (q_id_37, 'Air particles are sticky', 2, false, ''),
    (q_id_37, 'The balloon gets lighter', 3, false, ''),
    (q_id_37, 'The air turns into a solid', 4, false, '');
END $$;

-- Question 38: Which of the following cannot flow?...
DO $$
DECLARE
  q_id_38 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following cannot flow?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'Wood is a solid. Particles in a solid are held in fixed positions and cannot slide over each other to flow.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_38;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_38, 'Water', 1, false, ''),
    (q_id_38, 'Honey', 2, false, ''),
    (q_id_38, 'Air', 3, false, ''),
    (q_id_38, 'Wood', 4, true, '');
END $$;

-- Question 39: Two atoms of Hydrogen combine to form a stable par...
DO $$
DECLARE
  q_id_39 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Two atoms of Hydrogen combine to form a stable particle called a:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'When atoms combine chemically, they form a molecule, which is the smallest unit of a substance that can exist independently.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_39;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_39, 'Proton', 1, false, ''),
    (q_id_39, 'Molecule', 2, true, ''),
    (q_id_39, 'Mixture', 3, false, ''),
    (q_id_39, 'Solution', 4, false, '');
END $$;

-- Question 40: The interparticle distance is maximum in:...
DO $$
DECLARE
  q_id_40 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The interparticle distance is maximum in:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'Water vapor is the gaseous state of water, where particles are farthest apart.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_40;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_40, 'Ice', 1, false, ''),
    (q_id_40, 'Water', 2, false, ''),
    (q_id_40, 'Water Vapor', 3, true, ''),
    (q_id_40, 'Mercury', 4, false, '');
END $$;

-- Question 41: What happens when you dissolve sugar in water rega...
DO $$
DECLARE
  q_id_41 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What happens when you dissolve sugar in water regarding the volume?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'hard',
    10,
    true,
    'Sugar particles fit into the small spaces between water particles, so the total volume does not increase noticeably.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_41;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_41, 'Volume increases significantly', 1, false, ''),
    (q_id_41, 'Volume decreases', 2, false, ''),
    (q_id_41, 'Volume stays almost the same', 3, true, ''),
    (q_id_41, 'Water disappears', 4, false, '');
END $$;

-- Question 42: Particles in a __________ only vibrate about their...
DO $$
DECLARE
  q_id_42 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Particles in a __________ only vibrate about their fixed positions.',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'In solids, the kinetic energy is low and forces are strong, so particles cannot move away from their fixed spots.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_42;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_42, 'Liquid', 1, false, ''),
    (q_id_42, 'Solid', 2, true, ''),
    (q_id_42, 'Gas', 3, false, ''),
    (q_id_42, 'Solution', 4, false, '');
END $$;

-- Question 43: Which of the following is NOT an example of matter...
DO $$
DECLARE
  q_id_43 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is NOT an example of matter?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'Matter must have mass and occupy space. A feeling is a sensation/emotion and does not consist of particles.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_43;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_43, 'Air', 1, false, ''),
    (q_id_43, 'Feeling of cold', 2, true, ''),
    (q_id_43, 'Raindrops', 3, false, ''),
    (q_id_43, 'Sand', 4, false, '');
END $$;

-- Question 44: When we pour a liquid from a flask into a bowl, it...
DO $$
DECLARE
  q_id_44 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'When we pour a liquid from a flask into a bowl, it changes its:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Liquids have a fixed volume but no fixed shape; they take the shape of the container.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_44;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_44, 'Volume', 1, false, ''),
    (q_id_44, 'Mass', 2, false, ''),
    (q_id_44, 'Shape', 3, true, ''),
    (q_id_44, 'Density', 4, false, '');
END $$;

-- Question 45: The density of matter is generally highest in whic...
DO $$
DECLARE
  q_id_45 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The density of matter is generally highest in which state?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Because particles are most closely packed in solids, they usually have the most mass per unit volume.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_45;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_45, 'Solid', 1, true, ''),
    (q_id_45, 'Liquid', 2, false, ''),
    (q_id_45, 'Gas', 3, false, ''),
    (q_id_45, 'It is same for all', 4, false, '');
END $$;

-- Question 46: A diver is able to cut through water in a swimming...
DO $$
DECLARE
  q_id_46 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A diver is able to cut through water in a swimming pool. Which property of matter does this observation show?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'hard',
    10,
    true,
    'The ability to move through a substance indicates that there are spaces between its particles and the forces of attraction can be overcome.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_46;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_46, 'Particles of water are very large', 1, false, ''),
    (q_id_46, 'There are spaces between particles of water', 2, true, ''),
    (q_id_46, 'Water has no mass', 3, false, ''),
    (q_id_46, 'Water particles have no attraction', 4, false, '');
END $$;

-- Question 47: Diffusion occurs fastest in gases because:...
DO $$
DECLARE
  q_id_47 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Diffusion occurs fastest in gases because:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Due to high speeds and large spaces between them, gas particles intermix with other particles very quickly.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_47;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_47, 'Gas particles are heavier', 1, false, ''),
    (q_id_47, 'Gas particles have low kinetic energy', 2, false, ''),
    (q_id_47, 'Gas particles move rapidly in all directions', 3, true, ''),
    (q_id_47, 'Gases have no particles', 4, false, '');
END $$;

-- Question 48: Which of the following can be termed 'fluids'?...
DO $$
DECLARE
  q_id_48 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following can be termed ''fluids''?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Fluids are substances that can flow. Both liquids and gases have this ability.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_48;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_48, 'Solids and Liquids', 1, false, ''),
    (q_id_48, 'Liquids and Gases', 2, true, ''),
    (q_id_48, 'Solids and Gases', 3, false, ''),
    (q_id_48, 'Only Liquids', 4, false, '');
END $$;

-- Question 49: If you put a drop of ink in a glass of water, it s...
DO $$
DECLARE
  q_id_49 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'If you put a drop of ink in a glass of water, it spreads without stirring. This process is:',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'easy',
    10,
    true,
    'Diffusion is the movement of particles from an area of higher concentration to lower concentration.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_49;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_49, 'Filtration', 1, false, ''),
    (q_id_49, 'Sedimentation', 2, false, ''),
    (q_id_49, 'Diffusion', 3, true, ''),
    (q_id_49, 'Evaporation', 4, false, '');
END $$;

-- Question 50: In the 'Activity with the Syringe', why was it imp...
DO $$
DECLARE
  q_id_50 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'In the ''Activity with the Syringe'', why was it impossible to push the piston when it was filled with sand?',
    'mcq',
    8,
    'science',
    'Particulate Nature of Matter',
    'medium',
    10,
    true,
    'Solids like sand have very little space between particles, making them nearly impossible to compress further.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_50;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_50, 'Sand is a gas', 1, false, ''),
    (q_id_50, 'Sand particles are already very close (solids are incompressible)', 2, true, ''),
    (q_id_50, 'The syringe was broken', 3, false, ''),
    (q_id_50, 'Sand has no particles', 4, false, '');
END $$;

-- Question 51: Which of the following is the simplest form of mat...
DO $$
DECLARE
  q_id_51 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is the simplest form of matter that cannot be broken down into simpler substances by chemical means?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'An element is a pure substance made of only one kind of atom and cannot be split into simpler substances.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_51;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_51, 'Compound', 1, false, ''),
    (q_id_51, 'Mixture', 2, false, ''),
    (q_id_51, 'Element', 3, true, ''),
    (q_id_51, 'Solution', 4, false, '');
END $$;

-- Question 52: When two or more elements combine chemically in a ...
DO $$
DECLARE
  q_id_52 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'When two or more elements combine chemically in a fixed ratio, they form a:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'A compound is a substance formed when atoms of two or more elements bond together chemically in a definite proportion by mass.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_52;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_52, 'Mixture', 1, false, ''),
    (q_id_52, 'Compound', 2, true, ''),
    (q_id_52, 'Alloy', 3, false, ''),
    (q_id_52, 'Isotope', 4, false, '');
END $$;

-- Question 53: Which of these is a characteristic of a mixture bu...
DO $$
DECLARE
  q_id_53 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of these is a characteristic of a mixture but NOT a compound?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Mixtures are physically combined, so their components can be separated using physical means like filtration or evaporation.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_53;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_53, 'Components are in a fixed ratio', 1, false, ''),
    (q_id_53, 'It has a new set of properties', 2, false, ''),
    (q_id_53, 'Components can be separated by physical methods', 3, true, ''),
    (q_id_53, 'It is always homogeneous', 4, false, '');
END $$;

-- Question 54: The chemical formula for Common Salt is:...
DO $$
DECLARE
  q_id_54 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The chemical formula for Common Salt is:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Common salt is the compound Sodium Chloride, represented by the formula NaCl.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_54;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_54, 'H2O', 1, false, ''),
    (q_id_54, 'CO2', 2, false, ''),
    (q_id_54, 'NaCl', 3, true, ''),
    (q_id_54, 'C12H22O11', 4, false, '');
END $$;

-- Question 55: Which of the following is an example of a homogene...
DO $$
DECLARE
  q_id_55 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is an example of a homogeneous mixture?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'A homogeneous mixture has a uniform composition throughout; saltwater is a perfect example as the salt is evenly distributed.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_55;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_55, 'Saltwater solution', 1, true, ''),
    (q_id_55, 'Chalk in water', 2, false, ''),
    (q_id_55, 'Oil and water', 3, false, ''),
    (q_id_55, 'Iron filings and sulfur', 4, false, '');
END $$;

-- Question 56: The symbol for the element Gold is:...
DO $$
DECLARE
  q_id_56 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The symbol for the element Gold is:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Au comes from the Latin word ''Aurum'', which means gold.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_56;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_56, 'Ag', 1, false, ''),
    (q_id_56, 'Au', 2, true, ''),
    (q_id_56, 'Fe', 3, false, ''),
    (q_id_56, 'Cu', 4, false, '');
END $$;

-- Question 57: Water (H2O) is classified as a compound because:...
DO $$
DECLARE
  q_id_57 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Water (H2O) is classified as a compound because:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Compounds have a fixed chemical composition and the elements involved are bonded together.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_57;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_57, 'It can be separated by filtration', 1, false, ''),
    (q_id_57, 'Hydrogen and Oxygen are chemically bonded in a 2:1 ratio', 2, true, ''),
    (q_id_57, 'It exists in three states: solid, liquid, and gas', 3, false, ''),
    (q_id_57, 'It is a mixture of two gases', 4, false, '');
END $$;

-- Question 58: Which of the following mixtures can be separated u...
DO $$
DECLARE
  q_id_58 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following mixtures can be separated using a magnet?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Iron is a magnetic material, so a magnet can easily pull iron filings out of a non-magnetic mixture like sand.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_58;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_58, 'Salt and Sugar', 1, false, ''),
    (q_id_58, 'Sand and Water', 2, false, ''),
    (q_id_58, 'Iron filings and Sand', 3, true, ''),
    (q_id_58, 'Sulfur and Charcoal', 4, false, '');
END $$;

-- Question 59: Air is considered a mixture because:...
DO $$
DECLARE
  q_id_59 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Air is considered a mixture because:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Air contains various gases like Nitrogen, Oxygen, and CO2 that are not chemically bonded and whose proportions can change.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_59;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_59, 'It is colorless', 1, false, ''),
    (q_id_59, 'Its composition of gases can vary slightly', 2, true, ''),
    (q_id_59, 'It is necessary for breathing', 3, false, ''),
    (q_id_59, 'It contains only one type of molecule', 4, false, '');
END $$;

-- Question 60: When iron and sulfur are heated together to form i...
DO $$
DECLARE
  q_id_60 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'When iron and sulfur are heated together to form iron sulfide, the product:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'hard',
    10,
    true,
    'Iron sulfide is a compound; once formed, it loses the individual properties of its constituent elements.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_60;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_60, 'Retains the magnetic property of iron', 1, false, ''),
    (q_id_60, 'Can be separated by a magnet', 2, false, ''),
    (q_id_60, 'Has entirely different properties from iron and sulfur', 3, true, ''),
    (q_id_60, 'Is a yellow and black mixture', 4, false, '');
END $$;

-- Question 61: The horizontal rows in a Periodic Table are called...
DO $$
DECLARE
  q_id_61 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The horizontal rows in a Periodic Table are called:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'The Periodic Table is arranged in horizontal rows called periods and vertical columns called groups.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_61;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_61, 'Groups', 1, false, ''),
    (q_id_61, 'Periods', 2, true, ''),
    (q_id_61, 'Columns', 3, false, ''),
    (q_id_61, 'Families', 4, false, '');
END $$;

-- Question 62: Which of these is a noble gas?...
DO $$
DECLARE
  q_id_62 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of these is a noble gas?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Helium is a noble gas (Group 18) because it is very stable and rarely reacts with other elements.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_62;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_62, 'Oxygen', 1, false, ''),
    (q_id_62, 'Nitrogen', 2, false, ''),
    (q_id_62, 'Helium', 3, true, ''),
    (q_id_62, 'Chlorine', 4, false, '');
END $$;

-- Question 63: A mixture of oil and water is an example of a:...
DO $$
DECLARE
  q_id_63 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A mixture of oil and water is an example of a:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Oil and water do not mix uniformly and form visible separate layers, making it a heterogeneous mixture.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_63;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_63, 'Homogeneous mixture', 1, false, ''),
    (q_id_63, 'Heterogeneous mixture', 2, true, ''),
    (q_id_63, 'Pure substance', 3, false, ''),
    (q_id_63, 'Compound', 4, false, '');
END $$;

-- Question 64: What is the smallest unit of a compound that maint...
DO $$
DECLARE
  q_id_64 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What is the smallest unit of a compound that maintains its chemical properties?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'A molecule is the smallest particle of a compound that has the chemical properties of that compound.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_64;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_64, 'Atom', 1, false, ''),
    (q_id_64, 'Electron', 2, false, ''),
    (q_id_64, 'Molecule', 3, true, ''),
    (q_id_64, 'Nucleus', 4, false, '');
END $$;

-- Question 65: Brass is an alloy of Copper and Zinc. Brass is a:...
DO $$
DECLARE
  q_id_65 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Brass is an alloy of Copper and Zinc. Brass is a:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Alloys like brass are mixtures because the metals are physically combined and can vary in proportions.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_65;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_65, 'Compound', 1, false, ''),
    (q_id_65, 'Solid solution (Mixture)', 2, true, ''),
    (q_id_65, 'Element', 3, false, ''),
    (q_id_65, 'Pure metal', 4, false, '');
END $$;

-- Question 66: Which of the following is NOT matter?...
DO $$
DECLARE
  q_id_66 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is NOT matter?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Matter must have mass and occupy space. Light is a form of energy and does not have mass.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_66;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_66, 'Oxygen gas', 1, false, ''),
    (q_id_66, 'Water vapor', 2, false, ''),
    (q_id_66, 'Light', 3, true, ''),
    (q_id_66, 'Dust', 4, false, '');
END $$;

-- Question 67: The elements in a compound are combined in a:...
DO $$
DECLARE
  q_id_67 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The elements in a compound are combined in a:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'According to the Law of Definite Proportions, a chemical compound always contains its component elements in fixed ratio.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_67;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_67, 'Random ratio', 1, false, ''),
    (q_id_67, 'Varying ratio', 2, false, ''),
    (q_id_67, 'Fixed ratio by mass', 3, true, ''),
    (q_id_67, 'Ratio of 1:1 always', 4, false, '');
END $$;

-- Question 68: If you stir sand into water, you create a:...
DO $$
DECLARE
  q_id_68 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'If you stir sand into water, you create a:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Sand in water is a suspension, a type of heterogeneous mixture where particles settle down over time.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_68;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_68, 'Solution', 1, false, ''),
    (q_id_68, 'Compound', 2, false, ''),
    (q_id_68, 'Suspension', 3, true, ''),
    (q_id_68, 'Element', 4, false, '');
END $$;

-- Question 69: Which gas is used in advertising signs for its bri...
DO $$
DECLARE
  q_id_69 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which gas is used in advertising signs for its bright glow when electricity passes through it?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Neon is widely used in neon signs because it emits a bright reddish-orange glow.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_69;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_69, 'Hydrogen', 1, false, ''),
    (q_id_69, 'Nitrogen', 2, false, ''),
    (q_id_69, 'Neon', 3, true, ''),
    (q_id_69, 'Argon', 4, false, '');
END $$;

-- Question 70: Pure gold is 24 carats. 22 carat gold is a:...
DO $$
DECLARE
  q_id_70 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Pure gold is 24 carats. 22 carat gold is a:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'hard',
    10,
    true,
    '22 carat gold contains other metals like copper or silver to make it harder, making it a mixture (alloy).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_70;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_70, 'Pure element', 1, false, ''),
    (q_id_70, 'Compound', 2, false, ''),
    (q_id_70, 'Mixture', 3, true, ''),
    (q_id_70, 'Noble gas', 4, false, '');
END $$;

-- Question 71: Which scientist is famously associated with the de...
DO $$
DECLARE
  q_id_71 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which scientist is famously associated with the development of the Periodic Table?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Mendeleev is known as the father of the Periodic Table for organizing elements based on their properties.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_71;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_71, 'Isaac Newton', 1, false, ''),
    (q_id_71, 'Dmitri Mendeleev', 2, true, ''),
    (q_id_71, 'Albert Einstein', 3, false, ''),
    (q_id_71, 'Antoine Lavoisier', 4, false, '');
END $$;

-- Question 72: Which of these is a diatomic element (exists natur...
DO $$
DECLARE
  q_id_72 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of these is a diatomic element (exists naturally as a molecule of two atoms)?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'hard',
    10,
    true,
    'Oxygen naturally exists as O2, meaning two oxygen atoms are bonded together.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_72;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_72, 'Helium', 1, false, ''),
    (q_id_72, 'Carbon', 2, false, ''),
    (q_id_72, 'Oxygen', 3, true, ''),
    (q_id_72, 'Gold', 4, false, '');
END $$;

-- Question 73: Distilled water is a/an:...
DO $$
DECLARE
  q_id_73 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Distilled water is a/an:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Distilled water consists only of H2O molecules, making it a pure compound.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_73;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_73, 'Element', 1, false, ''),
    (q_id_73, 'Compound', 2, true, ''),
    (q_id_73, 'Homogeneous mixture', 3, false, ''),
    (q_id_73, 'Heterogeneous mixture', 4, false, '');
END $$;

-- Question 74: The process of separating a solid from a liquid by...
DO $$
DECLARE
  q_id_74 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The process of separating a solid from a liquid by pouring it through a porous material is called:',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'easy',
    10,
    true,
    'Filtration is a physical method used to separate insoluble solids from a liquid mixture.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_74;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_74, 'Evaporation', 1, false, ''),
    (q_id_74, 'Filtration', 2, true, ''),
    (q_id_74, 'Decantation', 3, false, ''),
    (q_id_74, 'Distillation', 4, false, '');
END $$;

-- Question 75: What happens when sugar dissolves in water?...
DO $$
DECLARE
  q_id_75 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What happens when sugar dissolves in water?',
    'mcq',
    8,
    'science',
    'Nature of Matter: Elements, Compounds, and Mixtures',
    'medium',
    10,
    true,
    'Sugar dissolving in water is a physical change that results in a homogeneous mixture (solution).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_75;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_75, 'A new compound is formed', 1, false, ''),
    (q_id_75, 'A mixture is formed', 2, true, ''),
    (q_id_75, 'Water breaks down into elements', 3, false, ''),
    (q_id_75, 'Sugar atoms disappear', 4, false, '');
END $$;

-- Question 76: Which of the following is an example of a uniform ...
DO $$
DECLARE
  q_id_76 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is an example of a uniform (homogeneous) mixture?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'A uniform mixture is one where components are evenly distributed throughout. Salt dissolves completely in water to form such a mixture.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_76;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_76, 'Chalk powder in water', 1, false, ''),
    (q_id_76, 'Salt in water', 2, true, ''),
    (q_id_76, 'Sand in water', 3, false, ''),
    (q_id_76, 'Sawdust in water', 4, false, '');
END $$;

-- Question 77: In a solution of sugar and water, sugar is the ___...
DO $$
DECLARE
  q_id_77 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'In a solution of sugar and water, sugar is the __________ and water is the __________.',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'The substance being dissolved is the solute (sugar), and the substance that does the dissolving is the solvent (water).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_77;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_77, 'Solvent, Solute', 1, true, ''),
    (q_id_77, 'Solute, Solvent', 2, false, ''),
    (q_id_77, 'Solute, Solution', 3, false, ''),
    (q_id_77, 'Solvent, Mixture', 4, false, '');
END $$;

-- Question 78: Water is often called a 'Universal Solvent' becaus...
DO $$
DECLARE
  q_id_78 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Water is often called a ''Universal Solvent'' because:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Water has a unique ability to dissolve more substances than any other liquid, earning it the title of universal solvent.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_78;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_78, 'It is found everywhere on Earth', 1, false, ''),
    (q_id_78, 'It can dissolve a large variety of substances', 2, true, ''),
    (q_id_78, 'It is used in all industrial processes', 3, false, ''),
    (q_id_78, 'It is tasteless and odourless', 4, false, '');
END $$;

-- Question 79: A solution in which no more solute can be dissolve...
DO $$
DECLARE
  q_id_79 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A solution in which no more solute can be dissolved at a given temperature is called a/an:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'When a solvent has dissolved the maximum amount of solute possible at a specific temperature, it becomes saturated.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_79;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_79, 'Unsaturated solution', 1, false, ''),
    (q_id_79, 'Dilute solution', 2, false, ''),
    (q_id_79, 'Saturated solution', 3, true, ''),
    (q_id_79, 'Concentrated solution', 4, false, '');
END $$;

-- Question 80: What happens to the solubility of sugar in water i...
DO $$
DECLARE
  q_id_80 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What happens to the solubility of sugar in water if the temperature of the water is increased?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Generally, increasing the temperature increases the solubility of solid solutes like sugar in a liquid solvent.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_80;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_80, 'It decreases', 1, false, ''),
    (q_id_80, 'It increases', 2, true, ''),
    (q_id_80, 'It remains the same', 3, false, ''),
    (q_id_80, 'The sugar stops dissolving', 4, false, '');
END $$;

-- Question 81: Which of the following describes a 'dilute' soluti...
DO $$
DECLARE
  q_id_81 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following describes a ''dilute'' solution?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'A dilute solution contains a small amount of solute relative to the amount of solvent.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_81;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_81, 'A solution with very little solute', 1, true, ''),
    (q_id_81, 'A solution with a lot of solute', 2, false, ''),
    (q_id_81, 'A solution that cannot dissolve more solute', 3, false, ''),
    (q_id_81, 'A mixture of oil and water', 4, false, '');
END $$;

-- Question 82: Which process is used to recover salt from sea wat...
DO $$
DECLARE
  q_id_82 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which process is used to recover salt from sea water?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'Evaporation allows the water to turn into vapor, leaving behind the solid salt crystals.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_82;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_82, 'Filtration', 1, false, ''),
    (q_id_82, 'Decantation', 2, false, ''),
    (q_id_82, 'Evaporation', 3, true, ''),
    (q_id_82, 'Condensation', 4, false, '');
END $$;

-- Question 83: Why do aquatic animals like fish survive in ponds ...
DO $$
DECLARE
  q_id_83 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Why do aquatic animals like fish survive in ponds and rivers?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Gases like oxygen dissolve in water, which aquatic animals use for respiration.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_83;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_83, 'They breathe water directly', 1, false, ''),
    (q_id_83, 'Oxygen from the air dissolves in the water', 2, true, ''),
    (q_id_83, 'They produce their own oxygen', 3, false, ''),
    (q_id_83, 'Water is made of oxygen atoms', 4, false, '');
END $$;

-- Question 84: What is the result of mixing two or more substance...
DO $$
DECLARE
  q_id_84 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What is the result of mixing two or more substances that do not chemically react?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'A mixture is formed when two or more substances are combined physically without a chemical reaction.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_84;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_84, 'A new element', 1, false, ''),
    (q_id_84, 'A mixture', 2, true, ''),
    (q_id_84, 'A compound', 3, false, ''),
    (q_id_84, 'A solid', 4, false, '');
END $$;

-- Question 85: Carbonated drinks (soda) are examples of:...
DO $$
DECLARE
  q_id_85 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Carbonated drinks (soda) are examples of:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Carbon dioxide gas is dissolved in the liquid drink under pressure.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_85;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_85, 'Solid in liquid solution', 1, false, ''),
    (q_id_85, 'Gas in liquid solution', 2, true, ''),
    (q_id_85, 'Liquid in liquid solution', 3, false, ''),
    (q_id_85, 'Gas in gas solution', 4, false, '');
END $$;

-- Question 86: Which factor does NOT affect how fast a solid solu...
DO $$
DECLARE
  q_id_86 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which factor does NOT affect how fast a solid solute dissolves in a liquid?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'While stirring, heat, and particle size (crushing) affect the rate of dissolution, the container''s shape does not.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_86;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_86, 'Stirring the mixture', 1, false, ''),
    (q_id_86, 'Temperature of the solvent', 2, false, ''),
    (q_id_86, 'Size of the solute particles', 3, false, ''),
    (q_id_86, 'The shape of the container', 4, true, '');
END $$;

-- Question 87: If you have a saturated solution of salt, how can ...
DO $$
DECLARE
  q_id_87 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'If you have a saturated solution of salt, how can you make it unsaturated without adding more water?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'hard',
    10,
    true,
    'Heating increases solubility, allowing the solution to hold more solute, thus making it temporarily unsaturated.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_87;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_87, 'By cooling it', 1, false, ''),
    (q_id_87, 'By heating it', 2, true, ''),
    (q_id_87, 'By stirring it faster', 3, false, ''),
    (q_id_87, 'By adding more salt', 4, false, '');
END $$;

-- Question 88: Soft drinks fizz when opened because:...
DO $$
DECLARE
  q_id_88 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Soft drinks fizz when opened because:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Gases are more soluble at high pressure. Opening the bottle drops the pressure, causing the dissolved CO2 to escape.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_88;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_88, 'The liquid evaporates', 1, false, ''),
    (q_id_88, 'The pressure decreases, reducing gas solubility', 2, true, ''),
    (q_id_88, 'The temperature increases', 3, false, ''),
    (q_id_88, 'The liquid reacts with air', 4, false, '');
END $$;

-- Question 89: What is 'solubility'?...
DO $$
DECLARE
  q_id_89 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What is ''solubility''?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Solubility is the measure of how much solute can be held by a solvent under specific conditions.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_89;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_89, 'The total volume of a solution', 1, false, ''),
    (q_id_89, 'The speed at which a solute dissolves', 2, false, ''),
    (q_id_89, 'The maximum amount of solute that can dissolve in a specific amount of solvent at a certain temperature', 3, true, ''),
    (q_id_89, 'The ability of a liquid to flow', 4, false, '');
END $$;

-- Question 90: Which of these is a solution of a gas in a gas?...
DO $$
DECLARE
  q_id_90 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of these is a solution of a gas in a gas?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'Air is a homogeneous mixture (solution) of various gases like nitrogen, oxygen, and others.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_90;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_90, 'Fog', 1, false, ''),
    (q_id_90, 'Air', 2, true, ''),
    (q_id_90, 'Soda water', 3, false, ''),
    (q_id_90, 'Smoke', 4, false, '');
END $$;

-- Question 91: Small round cakes of salt in Ningel village are wr...
DO $$
DECLARE
  q_id_91 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Small round cakes of salt in Ningel village are wrapped in:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'As mentioned in the ''Living Heritage'' section, traditional salt cakes are shaped using banana leaves.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_91;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_91, 'Plastic sheets', 1, false, ''),
    (q_id_91, 'Banana leaves', 2, true, ''),
    (q_id_91, 'Aluminium foil', 3, false, ''),
    (q_id_91, 'Paper', 4, false, '');
END $$;

-- Question 92: When sugar is dissolved in water, the volume of th...
DO $$
DECLARE
  q_id_92 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'When sugar is dissolved in water, the volume of the water does not increase significantly because:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'hard',
    10,
    true,
    'Liquid molecules have small spaces between them; dissolved solute particles occupy these spaces.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_92;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_92, 'Sugar is lighter than water', 1, false, ''),
    (q_id_92, 'Sugar particles fit into the empty spaces between water molecules', 2, true, ''),
    (q_id_92, 'Sugar turns into water', 3, false, ''),
    (q_id_92, 'The water evaporates', 4, false, '');
END $$;

-- Question 93: Which of the following will form a non-uniform (he...
DO $$
DECLARE
  q_id_93 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following will form a non-uniform (heterogeneous) mixture with water?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'Oil and water do not mix and form distinct layers, creating a non-uniform mixture.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_93;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_93, 'Honey', 1, false, ''),
    (q_id_93, 'Lemon juice', 2, false, ''),
    (q_id_93, 'Oil', 3, true, ''),
    (q_id_93, 'Alcohol', 4, false, '');
END $$;

-- Question 94: How can you separate a mixture of sand and salt?...
DO $$
DECLARE
  q_id_94 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'How can you separate a mixture of sand and salt?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'hard',
    10,
    true,
    'Salt is soluble in water but sand is not. Dissolving allows you to filter the sand and then recover salt by evaporation.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_94;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_94, 'By evaporation directly', 1, false, ''),
    (q_id_94, 'Dissolve in water, filter the sand, then evaporate the water', 2, true, ''),
    (q_id_94, 'Use a magnet', 3, false, ''),
    (q_id_94, 'By sieving', 4, false, '');
END $$;

-- Question 95: The components of an Oral Rehydration Solution (OR...
DO $$
DECLARE
  q_id_95 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'The components of an Oral Rehydration Solution (ORS) are:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'easy',
    10,
    true,
    'ORS is a uniform mixture of sugar and salt in water used to treat dehydration.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_95;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_95, 'Sugar, sand, and water', 1, false, ''),
    (q_id_95, 'Salt, chalk, and water', 2, false, ''),
    (q_id_95, 'Sugar, salt, and water', 3, true, ''),
    (q_id_95, 'Only sugar and water', 4, false, '');
END $$;

-- Question 96: Why is it easier to dissolve sugar in hot milk tha...
DO $$
DECLARE
  q_id_96 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Why is it easier to dissolve sugar in hot milk than in cold milk?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Heating the solvent increases the kinetic energy and solubility, making the solute dissolve faster and in greater amounts.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_96;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_96, 'Hot milk is thinner', 1, false, ''),
    (q_id_96, 'High temperature increases the rate of dissolving', 2, true, ''),
    (q_id_96, 'Cold milk reacts with sugar', 3, false, ''),
    (q_id_96, 'Sugar evaporates in hot milk', 4, false, '');
END $$;

-- Question 97: Which of the following is NOT a property of a true...
DO $$
DECLARE
  q_id_97 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Which of the following is NOT a property of a true solution?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'hard',
    10,
    true,
    'In a true solution, particles are so small they are invisible to the eye and do not settle.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_97;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_97, 'It is uniform throughout', 1, false, ''),
    (q_id_97, 'The solute particles can be seen with a naked eye', 2, true, ''),
    (q_id_97, 'The solute does not settle down over time', 3, false, ''),
    (q_id_97, 'It can pass through a filter paper', 4, false, '');
END $$;

-- Question 98: Tincture of iodine is a solution used as an antise...
DO $$
DECLARE
  q_id_98 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'Tincture of iodine is a solution used as an antiseptic. What is the solvent in it?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Tincture of iodine is iodine (solute) dissolved in alcohol (solvent).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_98;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_98, 'Water', 1, false, ''),
    (q_id_98, 'Iodine', 2, false, ''),
    (q_id_98, 'Alcohol', 3, true, ''),
    (q_id_98, 'Oil', 4, false, '');
END $$;

-- Question 99: What happens when you add more and more solute to ...
DO $$
DECLARE
  q_id_99 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'What happens when you add more and more solute to a fixed amount of solvent?',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Adding more solute increases its ratio to the solvent, making the solution more concentrated.',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_99;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_99, 'The solution becomes more dilute', 1, false, ''),
    (q_id_99, 'The solution becomes more concentrated', 2, true, ''),
    (q_id_99, 'The solvent evaporates', 3, false, ''),
    (q_id_99, 'The solute disappears', 4, false, '');
END $$;

-- Question 100: A solution of two or more metals, or a metal and a...
DO $$
DECLARE
  q_id_100 UUID;
BEGIN
  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)
  VALUES (
    'A solution of two or more metals, or a metal and a non-metal, is called a/an:',
    'mcq',
    8,
    'science',
    'The Amazing World of Solutes, Solvents, and Solutions',
    'medium',
    10,
    true,
    'Alloys are solid-in-solid solutions, such as brass (zinc in copper).',
    'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3'::uuid
  ) RETURNING id INTO q_id_100;

  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)
  VALUES
    (q_id_100, 'Amalgam', 1, false, ''),
    (q_id_100, 'Alloy', 2, true, ''),
    (q_id_100, 'Compound', 3, false, ''),
    (q_id_100, 'Element', 4, false, '');
END $$;

