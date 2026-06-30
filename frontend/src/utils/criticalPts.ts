const CRITICAL_SET = new Set([
  // Смерть
  "death", "sudden death", "completed suicide",
  // Суицид
  "suicidal ideation", "suicidal behaviour", "suicide attempt", "self-injurious ideation",
  // Сердце
  "cardiac arrest", "myocardial infarction", "cardiac failure", "ventricular fibrillation",
  "ventricular tachycardia", "arrhythmia",
  // Инсульт / сосуды
  "cerebrovascular accident", "stroke", "haemorrhage", "gastrointestinal haemorrhage",
  "intracranial haemorrhage", "pulmonary embolism", "embolism",
  // Анафилаксия
  "anaphylaxis", "anaphylactic reaction", "anaphylactic shock",
  // Передозировка
  "overdose", "toxicity to various agents",
  // Нейро
  "progressive multifocal leukoencephalopathy",
  // Судороги / потеря сознания
  "convulsion", "seizure", "loss of consciousness", "coma",
  // Онко
  "neoplasm malignant",
  // Инфекции
  "clostridium difficile infection",
  // Прочее жизнеугрожающее
  "respiratory failure", "acute respiratory distress syndrome", "sepsis",
  "organ failure", "liver failure", "renal failure",
  "hip fracture", "femur fracture", "tendon rupture",
  "priapism", "osteonecrosis of jaw",
  "pancreatitis", "lung necrosis",
  "congenital anomaly",
]);

export function isCritical(pt: string): boolean {
  return CRITICAL_SET.has(pt.toLowerCase());
}

export function hasCriticalReaction(reactions: string[]): boolean {
  return reactions.some((r) => isCritical(r));
}
