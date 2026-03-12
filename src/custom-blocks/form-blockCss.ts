/**
 * Custom CSS for Unlayer form/signup editor (e.g. preview background).
 * Translated from Vue (computed + getVariableValue) to React (pure function + config).
 * Returns the CSS string to pass to options.customCSS.
 */

export interface FormBlockCssConfig {
  /** Background color for .blockbuilder-preview (replaces --surface-neutral-small). */
  surfaceNeutralSmallColor?: string
}

const DEFAULT_SURFACE_NEUTRAL_SMALL = '#f5f5f5'

/**
 * Returns the custom CSS string for the signup/forms editor.
 * Use as options.customCSS (or in an array) when initializing the editor.
 */
export function getSignupFormsEditorCustomCSS(
  config: FormBlockCssConfig = {}
): string {
  const surfaceNeutralSmallColor =
    config.surfaceNeutralSmallColor ?? DEFAULT_SURFACE_NEUTRAL_SMALL

  return `
        .blockbuilder-preview {
            background-color: ${surfaceNeutralSmallColor};
        }
    `.trim()
}
