/**
 * Custom form block for Unlayer email editor.
 * Translated from Vue (computed + Pinia + i18n) to React (pure function + config).
 * Returns the script string to pass to options.customJS.
 */

export interface FormBlockConfig {
  /** Default field label / key name (e.g. "Email") */
  keyName?: string
  /** Tooltip background color (for "already added" tooltip) */
  tooltipBackground?: string
  /** Tooltip text color */
  tooltipColor?: string
  /** Labels for the tool (replaces i18n t()) */
  labels?: {
    formsFields?: string
    formsFormFields?: string
    formsEnterYourEmail?: string
    formsSubscribe?: string
    editorHoverBackground?: string
    editorHoverText?: string
    formsTooltipAlreadyAdded?: string
  }
}

const DEFAULT_LABELS = {
  formsFields: 'Fields',
  formsFormFields: 'Form Fields',
  formsEnterYourEmail: 'Enter your email',
  formsSubscribe: 'Subscribe',
  editorHoverBackground: 'Hover Background',
  editorHoverText: 'Hover Text',
  formsTooltipAlreadyAdded: 'You can only add one form block.',
}

const escapeHtmlFunction = `const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};`

const defaultFormStyles = 'display: flex; flex-direction: column; '
const defaultInputStyles = 'width: 100%;'
const defaultButtonStyles = 'border: none; border-radius: 4px; '

/** Script fragment that builds buttonHTML inside render (uses values). Uses single quotes so ${} is literal in output. */
function buildButtonHTMLFragment(): string {
  return (
    'let buttonHTML = `<div style=\'text-align: ${values.buttonAlign};\'>`;\n' +
    'buttonHTML += `<button class="form-submit-button" style=\'`;\n' +
    'buttonHTML += defaultButtonStyles;\n' +
    'buttonHTML += \'background-color: ${values["buttonColors.backgroundColor"]}; \';\n' +
    'buttonHTML += \'color: ${values["buttonColors.color"]}; \';\n' +
    'buttonHTML += `${values[\'buttonWidth.autoWidth\'] ? \'100%\' : \'auto\'}; `;\n' +
    'buttonHTML += `${values.buttonFontFamily && values.buttonFontFamily.value ? `font-family: ${escapeHtml(values.buttonFontFamily.value)}; ` : \'\'}`;\n' +
    'buttonHTML += `font-size: ${values.buttonFontSize}; `;\n' +
    'buttonHTML += `border-radius: ${values.buttonBorderRadius}; `;\n' +
    'buttonHTML += \'padding: ${values.buttonPadding}; \';\n' +
    'buttonHTML += \'margin: ${values.buttonMargin}; \';\n' +
    'buttonHTML += `\'>`;\n' +
    'buttonHTML += `${escapeHtml(values.buttonText || "")}`;\n' +
    "buttonHTML += '</button>';\n" +
    "buttonHTML += '</div>';\n"
  )
}

/** Script fragment for the form template (inside render, uses values and buttonHTML). Uses single quotes so ${} is literal. */
function buildRenderFormFragment(): string {
  const gap = defaultFormStyles + " gap: ${values.fieldDistance};'>\n"
  return (
    'const renderForm = `<form>\n' +
    "        <div style='" +
    gap +
    '        ${values?.fields?.map((field) => {\n' +
    "            let fieldLabelHtml = `<div style='`;\n" +
    "                if (values.labelFontFamily && values.labelFontFamily.value) {\n" +
    "                    fieldLabelHtml += `font-family: ${escapeHtml(values.labelFontFamily.value)}; `;\n" +
    "                }\n" +
    "                fieldLabelHtml += `color: ${values.labelTextColor}; `;\n" +
    "                fieldLabelHtml += `font-size: ${values.labelFontSize}; `;\n" +
    "                fieldLabelHtml += `text-align: ${values.labelAlign}; `;\n" +
    "                fieldLabelHtml += `padding: ${values.labelPadding}; `;\n" +
    "                fieldLabelHtml += `'>`;\n" +
    '                    fieldLabelHtml += `<label>${escapeHtml(field.label || "")} ${field.required ? \'<span class="required-label" style="color: #d32b3d">*</span>\' : ""}</label>`;\n' +
    "            fieldLabelHtml += '</div>';\n" +
    "            let fieldHtml = `<div class='input-field' data-id='${field.name}' data-type='${field.type}' data-required='${field.required}' data-date-format='${field.dateFormat}'>`;\n" +
    "            if (field.show_label) fieldHtml += fieldLabelHtml;\n" +
    "            let fieldType = field.type == 'date' || field.type == 'recurring_date' ? 'text' : field.type;\n" +
    "            fieldHtml += `<input type='${fieldType}' style='`;\n" +
    '            fieldHtml += "' +
    defaultInputStyles +
    " ';\n" +
    "            if (values.fieldFontFamily && values.fieldFontFamily.value) fieldHtml += `font-family: ${escapeHtml(values.fieldFontFamily.value)}; `;\n" +
    "            fieldHtml += `border-top-width: ${values.fieldBorder?.borderTopWidth}; `;\n" +
    "            fieldHtml += `border-top-style: ${values.fieldBorder?.borderTopStyle}; `;\n" +
    "            fieldHtml += `border-top-color: ${values.fieldBorder?.borderTopColor}; `;\n" +
    "            fieldHtml += `border-left-width: ${values.fieldBorder?.borderLeftWidth}; `;\n" +
    "            fieldHtml += `border-left-style: ${values.fieldBorder?.borderLeftStyle}; `;\n" +
    "            fieldHtml += `border-left-color: ${values.fieldBorder?.borderLeftColor}; `;\n" +
    "            fieldHtml += `border-right-width: ${values.fieldBorder?.borderRightWidth}; `;\n" +
    "            fieldHtml += `border-right-style: ${values.fieldBorder?.borderRightStyle}; `;\n" +
    "            fieldHtml += `border-right-color: ${values.fieldBorder?.borderRightColor}; `;\n" +
    "            fieldHtml += `border-bottom-width: ${values.fieldBorder?.borderBottomWidth}; `;\n" +
    "            fieldHtml += `border-bottom-style: ${values.fieldBorder?.borderBottomStyle}; `;\n" +
    "            fieldHtml += `border-bottom-color: ${values.fieldBorder?.borderBottomColor}; `;\n" +
    "            fieldHtml += `border-radius: ${values.fieldBorderRadius}; `;\n" +
    "            fieldHtml += `padding: ${values.fieldPadding}; `;\n" +
    "            fieldHtml += `background-color: ${values.fieldBackgroundColor}; `;\n" +
    "            fieldHtml += `color: ${values.fieldColor}; `;\n" +
    "            fieldHtml += `font-size: ${values.fieldFontSize}; `;\n" +
    '            fieldHtml += `\' `;\n' +
    "            fieldHtml += `placeholder='${escapeHtml(field.placeholder_text || \"\")}' `;\n" +
    "            fieldHtml += `name='${field.name}' `;\n" +
    "            fieldHtml += `autocomplete='off' `;\n" +
    "            if (field.required) fieldHtml += `required `;\n" +
    "            fieldHtml += '/>';\n" +
    "            fieldHtml += '</div>';\n" +
    "            return fieldHtml;\n" +
    "        }).join('')}\n" +
    "        </div>\n" +
    "        ${buttonHTML}\n" +
    "    </form>`;\n" +
    'return renderForm;\n'
  )
}

/**
 * Returns the custom JS string for the Unlayer form block.
 * Use as options.customJS (or in an array) when initializing the editor.
 */
export function getCustomFormBlockJS(config: FormBlockConfig = {}): string {
  const keyName = config.keyName ?? 'Email'
  const tooltipBackground = (config.tooltipBackground ?? '#333').trim()
  const tooltipColor = (config.tooltipColor ?? '#fff').trim()
  const labels = { ...DEFAULT_LABELS, ...config.labels }

  const buttonHTMLPart = buildButtonHTMLFragment()
  const renderFormPart = buildRenderFormFragment()

  return `
(function() {
    var defaultButtonStyles = ${JSON.stringify(defaultButtonStyles)};
    ${escapeHtmlFunction}
    unlayer.registerTool({
		name: 'custom_form_block',
		label: '${labels.formsFields.replace(/'/g, "\\'")}',
		icon: '<svg data-tool-name="custom_form_block" xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none"><path fill="currentColor" d="M24 0a4 4 0 0 1 4 4v20a4 4 0 0 1-3.794 3.995L24 28H4l-.206-.005a4 4 0 0 1-3.79-3.789L0 24V4a4 4 0 0 1 4-4h20ZM4 2a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm17.781 19.28h-16v-3h16v3ZM24 15H4V9h20v6ZM6 13h16v-2H6v2Zm7-6H4V5h9v2Z"/></svg>',
		supportedDisplayModes: ['web'],
        usageLimit: 1,
		options: {
            formFields: {
                title: 'Fields',
                position: 1,
                collapsed: false,
                options: {
                    fields: {
                        label: '${labels.formsFormFields.replace(/'/g, "\\'")}',
                        defaultValue: [{
                            type: 'email',
                            name: 'email',
                            label: '${keyName.replace(/'/g, "\\'")}',
                            options: '',
                            placeholder_text: '${labels.formsEnterYourEmail.replace(/'/g, "\\'")}',
                            show_label: false,
                            required: true,
                            meta_data: {},
                            dateFormat: ''
                        }],
                        widget: 'form_fields_picker',
                    },
                    fieldFontFamily: {
                        label: 'Font Family',
                        defaultValue: '',
                        widget: 'font_family',
                    },
                    fieldBorder: {
                        label: 'Border',
                        defaultValue: {
                            'borderTopWidth': '1px',
                            'borderTopStyle': 'solid',
                            'borderTopColor': '#95929E',
                            'borderLeftWidth': '1px',
                            'borderLeftStyle': 'solid',
                            'borderLeftColor': '#95929E',
                            'borderRightWidth': '1px',
                            'borderRightStyle': 'solid',
                            'borderRightColor': '#95929E',
                            'borderBottomWidth': '1px',
                            'borderBottomStyle': 'solid',
                            'borderBottomColor': '#95929E'
                        },
                        widget: 'border',
                        hidden: true,
                    },
                    fieldBorderRadius: {
                        label: 'Rounded Border',
                        defaultValue: '0px',
                        widget: 'border_radius',
                        hidden: true,
                    },
                    fieldPadding: {
                        label: 'Padding',
                        defaultValue: '12px 16px',
                        widget: 'padding',
                        hidden: true,
                    },
                    fieldBackgroundColor: {
                        label: 'Background Color',
                        defaultValue: '#FFFFFF',
                        widget: 'color_picker',
                        hidden: true,
                    },
                    fieldColor: {
                        label: 'Text Color',
                        defaultValue: '#000000',
                        widget: 'color_picker',
                        hidden: true,
                    },
                    fieldFontSize: {
                        label: 'Font Size',
                        defaultValue: '16px',
                        widget: 'px',
                        hidden: true,
                    },
                },
            },
            layout: {
                title: 'Layout',
                position: 2,
                collapsed: false,
                options: {
                    fieldDistance: {
                        label: 'Space Between Fields',
                        defaultValue: '12px',
                        widget: 'px',
                    },
                },
            },
            labels: {
                title: 'Labels',
                position: 2,
                collapsed: false,
                options: {
                    labelTextColor: {
                        label: 'Text Color',
                        defaultValue: '#444444',
                        widget: 'color_picker',
                    },
                    labelFontFamily: {
                        label: 'Font Family',
                        defaultValue: '',
                        widget: 'font_family',
                    },
                    labelFontSize: {
                        label: 'Font Size',
                        defaultValue: '14px',
                        widget: 'px',
                    },
                    labelAlign: {
                        label: 'Alignment',
                        defaultValue: 'left',
                        widget: 'alignment',
                    },
                    labelPadding: {
                        label: 'Padding',
                        defaultValue: '0px 0px 3px',
                        widget: 'padding',
                        hidden: true,
                    },
                },
            },
            button: {
                title: 'Button',
                position: 3,
                collapsed: false,
                options: {
                    buttonText: {
                        label: 'Text',
                        defaultValue: '${labels.formsSubscribe.replace(/'/g, "\\'")}',
                        widget: 'text',
                    },
                    'buttonColors.backgroundColor': {
                        label: 'Background Color',
                        defaultValue: '#262626',
                        widget: 'color_picker',
                    },
                    'buttonColors.color': {
                        label: 'Text Color',
                        defaultValue: '#FFFFFF',
                        widget: 'color_picker',
                    },
                    'buttonColors.hoverBackgroundColor': {
                        label: '${labels.editorHoverBackground.replace(/'/g, "\\'")}',
                        defaultValue: '#262626',
                        widget: 'color_picker',
                    },
                    'buttonColors.hoverColor': {
                        label: '${labels.editorHoverText.replace(/'/g, "\\'")}',
                        defaultValue: '#FFFFFF',
                        widget: 'color_picker',
                    },
                    buttonAlign: {
                        label: 'Alignment',
                        defaultValue: 'center',
                        widget: 'alignment',
                    },
                    'buttonWidth.autoWidth': {
                        label: 'Full Width',
                        defaultValue: true,
                        widget: 'toggle',
                    },
                    buttonFontFamily: {
                        label: 'Font Family',
                        defaultValue: '',
                        widget: 'font_family',
                    },
                    buttonFontSize: {
                        label: 'Font Size',
                        defaultValue: '16px',
                        widget: 'px',
                    },
                    buttonBorderRadius: {
                        label: 'Rounded Border',
                        defaultValue: '4px',
                        widget: 'border_radius',
                        hidden: true,
                    },
                    buttonPadding: {
                        label: 'Padding',
                        defaultValue: '14px 8px',
                        widget: 'padding',
                        hidden: true,
                    },
                    buttonMargin: {
                        label: 'Margin',
                        defaultValue: '24px 0px 0px',
                        widget: 'margin',
                        hidden: true,
                    },
                },
            },
        },
		values: {},
		renderer: {
			Viewer: unlayer.createViewer({
				render(values, data) {
					${escapeHtmlFunction}
					${buttonHTMLPart}
					${renderFormPart}
				}
			}),
			exporters: {
				web: function(values) {
					${escapeHtmlFunction}
					${buttonHTMLPart}
					${renderFormPart}
				}
			},
			head: {
				css: function(values) {
                    return \`
                        div[id="\${values._meta.htmlID}"] .form-submit-button:hover {
                            color: \${values['buttonColors.hoverColor']} !important;
                            background-color: \${values['buttonColors.hoverBackgroundColor']} !important;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }
                    \`;
                },
				js: function(values) {}
			}
		},
		validator(data) {
			return [];
		},
	});
    (function() {
        var TOOLTIP_TEXT = ${JSON.stringify(labels.formsTooltipAlreadyAdded)};
        var TOOLTIP_BG = ${JSON.stringify(tooltipBackground)};
        var TOOLTIP_COLOR = ${JSON.stringify(tooltipColor)};
        var showDelay = 0;
        var hideDelay = 0;
        var tooltipEl = null;
        var showTimer = null;
        var hideTimer = null;
        function createTooltipElement() {
            var el = document.createElement('div');
            el.setAttribute('role', 'tooltip');
            el.className = 'custom-form-block-tooltip';
            el.textContent = TOOLTIP_TEXT;
            el.style.cssText = 'position: fixed; z-index: 99999; padding: 8px; border-radius: 4px; font-size: 14px; line-height: 1.4; max-width: 200px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); pointer-events: none; opacity: 0; transition: opacity 0.15s ease;';
            el.style.background = TOOLTIP_BG;
            el.style.color = TOOLTIP_COLOR;
            return el;
        }
        function positionTooltip(trigger, tip) {
            var rect = trigger.getBoundingClientRect();
            var tipRect = tip.getBoundingClientRect();
            var gap = 0;
            var left = rect.left + (rect.width - tipRect.width) / 2;
            var top = rect.bottom + gap;
            if (left < 8) left = 8;
            if (left + tipRect.width > (window.innerWidth - 8)) left = window.innerWidth - tipRect.width - 8;
            tip.style.left = left + 'px';
            tip.style.top = top + 'px';
        }
        function show(trigger) {
            clearTimeout(hideTimer);
            hideTimer = null;
            if (showDelay > 0) {
                showTimer = setTimeout(function() { doShow(trigger); showTimer = null; }, showDelay);
            } else {
                doShow(trigger);
            }
        }
        function doShow(trigger) {
            if (!tooltipEl) {
                tooltipEl = createTooltipElement();
                document.body.appendChild(tooltipEl);
            }
            tooltipEl.textContent = TOOLTIP_TEXT;
            positionTooltip(trigger, tooltipEl);
            tooltipEl.style.opacity = '1';
        }
        function hide() {
            clearTimeout(showTimer);
            showTimer = null;
            if (hideDelay > 0) {
                hideTimer = setTimeout(function() { doHide(); hideTimer = null; }, hideDelay);
            } else {
                doHide();
            }
        }
        function doHide() {
            if (tooltipEl) tooltipEl.style.opacity = '0';
        }
        function isToolDisabled(el) {
            return el && (el.classList.contains('disabled') || el.getAttribute('aria-disabled') === 'true' || el.hasAttribute('data-disabled'));
        }
        function attachTooltip() {
            var svg = document.querySelector('svg[data-tool-name="custom_form_block"]');
            if (svg) {
                var parent = svg.closest('div.blockbuilder-content-tool');
                if (parent && !parent.hasAttribute('data-custom-tooltip-bound')) {
                    parent.setAttribute('data-custom-tooltip-bound', 'true');
                    parent.addEventListener('mouseenter', function(e) {
                        if (isToolDisabled(e.currentTarget)) show(e.currentTarget);
                    });
                    parent.addEventListener('mouseleave', function() { hide(); });
                }
                return true;
            }
            return false;
        }
        function addedNodeContainsTool(node) {
            if (node.nodeType !== 1) return false;
            if (node.querySelector && node.querySelector('svg[data-tool-name="custom_form_block"]')) return true;
            if (node.matches && node.matches('svg[data-tool-name="custom_form_block"]')) return true;
            return false;
        }
        if (!attachTooltip()) {
            var attempts = 0;
            var interval = setInterval(function() {
                if (attachTooltip() || ++attempts > 50) clearInterval(interval);
            }, 100);
        }
        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (addedNodeContainsTool(added[j])) {
                        attachTooltip();
                        return;
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    })();
})();
`
}
