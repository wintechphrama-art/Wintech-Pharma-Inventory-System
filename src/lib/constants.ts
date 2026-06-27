/**
 * Common material units for the unit dropdown.
 * Users can also type a custom value.
 */
export const MATERIAL_UNITS = [
  "Nos",
  "Kg",
  "Litre",
  "Meter",
  "Feet",
  "Pair",
  "Set",
  "Box",
  "Roll",
  "Bag",
] as const;

/**
 * Common material types for suggestions.
 * The field is free-text so users aren't limited to these.
 */
export const COMMON_MATERIAL_TYPES = [
  "Bolt",
  "Nut",
  "Washer",
  "Bearing",
  "Belt",
  "Pipe",
  "Wire",
  "Oil",
  "Grease",
  "Filter",
  "Gasket",
  "Seal",
  "Spring",
  "Screw",
  "Blade",
  "Brush",
  "Valve",
  "Hose",
] as const;

export const MACHINE_STATUS_LABELS: Record<string, string> = {
  true: "Active",
  false: "Inactive",
};

export const MATERIAL_STATUS_LABELS: Record<string, string> = {
  true: "Active",
  false: "Inactive",
};
