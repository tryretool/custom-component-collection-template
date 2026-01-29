/**
 * ============================================================================
 * MODERN TABLE STYLING - COMPLETE REFERENCE
 * ============================================================================
 * 
 * A comprehensive guide to creating professional, interactive tables with
 * modern UI/UX patterns.
 * 
 * TABLE OF CONTENTS:
 * 1. Color Palette & Design System
 * 2. Helper Functions
 * 3. Complete React Component
 * 4. Styling Patterns & Code Snippets
 * 5. Quick Reference
 * 
 * FEATURES:
 * ✅ Gradient hover effects
 * ✅ Interactive badges with scale animations
 * ✅ Color-coded status indicators
 * ✅ Professional search input with focus states
 * ✅ Smooth transitions and micro-interactions
 * ✅ Empty states with icons
 * ✅ Responsive layouts
 * 
 * ============================================================================
 */

import React, { useState } from 'react';

// ============================================================================
// 1. COLOR PALETTE & DESIGN SYSTEM
// ============================================================================

/**
 * Complete color palette used throughout the table
 */
const COLORS = {
    // Primary Colors
    indigo: '#6366f1',              // Primary interactive color
    indigoLight: 'rgba(99, 102, 241, 0.05)',
    indigoRing: 'rgba(99, 102, 241, 0.1)',
    purple: '#a855f7',              // Gradient accents
    purpleLight: 'rgba(168, 85, 247, 0.05)',

    // Status Colors - Emerald (Success/Positive)
    emerald: {
        bg: '#dcfce7',
        text: '#166534',
        border: '#bbf7d0'
    },

    // Status Colors - Blue (Good/Average)
    blue: {
        bg: '#dbeafe',
        text: '#1e40af',
        border: '#bfdbfe'
    },

    // Status Colors - Amber (Warning/Partial)
    amber: {
        bg: '#fef3c7',
        text: '#92400e',
        border: '#fde68a'
    },

    // Status Colors - Red (Error/Negative)
    red: {
        bg: '#fee2e2',
        text: '#991b1b',
        border: '#fecaca',
        solid: '#dc2626'
    },

    // Success/Positive
    green: '#16a34a',

    // Neutral Colors - Slate
    slate: {
        bg: '#f8fafc',
        text: '#64748b',
        border: '#e2e8f0',
        light: '#f1f5f9',
        dark: '#475569'
    },

    // Gray Scale
    gray: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        900: '#0f172a'
    }
};

/**
 * Spacing and sizing system
 */
const SPACING = {
    // Padding
    cellPadding: '14px 20px',
    cellPaddingFirst: '14px 20px 14px 24px',
    containerPadding: '16px 20px',
    statsPadding: '12px 20px',

    // Border Radius
    cardRadius: '12px',
    badgeRadius: '8px',
    pillRadius: '9999px',

    // Shadows
    cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    hoverShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.1)',
    focusRing: '0 0 0 3px rgba(99, 102, 241, 0.1)',
    badgeShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',

    // Transitions
    transition: 'all 0.2s'
};

// ============================================================================
// 2. HELPER FUNCTIONS FOR COLOR CODING
// ============================================================================

/**
 * Returns color styles for learning behavior status
 * 
 * @param status - The learning behavior status string
 * @returns Object with bg, color, and border properties
 * 
 * @example
 * const style = getLearningBehaviorColor('Fully Engaged');
 * // Returns: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }
 */
const getLearningBehaviorColor = (status?: string) => {
    const s = (status || '').toLowerCase();

    // Green for engaged/positive states
    if (s.includes('receptive') || s.includes('engaged') || s.includes('proactive') || s.includes('fully')) {
        return COLORS.emerald;
    }

    // Amber for partial/mixed states
    if (s.includes('disinterested') || s.includes('resistant') || s.includes('partially')) {
        return COLORS.amber;
    }

    // Slate for neutral/default
    return { bg: COLORS.slate.light, color: COLORS.slate.dark, border: COLORS.slate.border };
};

/**
 * Returns text color for customer impact outcomes
 * 
 * @param outcome - The customer impact outcome string
 * @returns Color hex string
 * 
 * @example
 * const color = getImpactColor('Negative');
 * // Returns: '#dc2626' (red)
 */
const getImpactColor = (outcome?: string) => {
    const o = (outcome || '').toLowerCase();

    if (o.includes('negative')) return COLORS.red.solid;
    if (o.includes('positive') || o.includes('neutral')) return COLORS.green;

    return COLORS.slate.text;
};

/**
 * Returns text color for performance levels
 * 
 * @param level - The performance level string
 * @returns Color hex string
 * 
 * @example
 * const color = getPerformanceLevelColor('Strong');
 * // Returns: '#16a34a' (green)
 */
const getPerformanceLevelColor = (level?: string) => {
    const l = (level || '').toLowerCase();

    if (l.includes('strong') || l.includes('excellent')) return COLORS.green;
    if (l.includes('weak') || l.includes('incorrect') || l.includes("didn't know")) return COLORS.red.solid;
    if (l.includes('good') || l.includes('average')) return '#d97706'; // amber solid

    return COLORS.slate.text;
};

/**
 * Returns complete style object for score badges
 * 
 * @param score - The score/status string
 * @returns Object with bg, color, and border properties
 * 
 * @example
 * const style = getScoreBadgeStyle('Strong');
 * // Returns: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }
 */
const getScoreBadgeStyle = (score: string) => {
    const s = score.toLowerCase();

    // Green for excellent/strong
    if (s.includes('strong') || s.includes('excellent') || s.includes('engaged')) {
        return COLORS.emerald;
    }

    // Blue for good/average
    if (s.includes('good') || s.includes('average') || s.includes('partial')) {
        return COLORS.blue;
    }

    // Red for weak/poor
    if (s.includes('weak') || s.includes('poor')) {
        return COLORS.red;
    }

    // Slate for default
    return { bg: COLORS.slate.light, color: COLORS.slate.dark, border: COLORS.slate.border };
};

// ============================================================================
// 3. COMPLETE REACT COMPONENT
// ============================================================================

interface TableRecord {
    id: string;
    created_at: string;
    sop_tag?: string;
    pressure_tag?: string;
}

/**
 * Modern Table Component with Professional Styling
 * 
 * Features:
 * - Gradient hover effects on rows
 * - Interactive badges with scale animations
 * - Color-coded status indicators
 * - Search functionality with focus states
 * - Empty state with icon and clear button
 */
export const ModernStyledTable = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState<TableRecord[]>([]);

    // Filter records based on search query
    const filteredRecords = records.filter((record) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            record.id.toLowerCase().includes(searchLower) ||
            (record.sop_tag || '').toLowerCase().includes(searchLower) ||
            (record.pressure_tag || '').toLowerCase().includes(searchLower)
        );
    });

    return (
        <div style={{
            width: '100%',
            padding: '32px',
            boxSizing: 'border-box',
            background: COLORS.slate.bg
        }}>

            {/* ================================================================
          HEADER SECTION
          ================================================================ */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                background: 'white',
                padding: SPACING.containerPadding,
                borderRadius: SPACING.cardRadius,
                border: `1px solid ${COLORS.slate.border}`,
                boxShadow: SPACING.cardShadow,
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '4px',
                        color: COLORS.gray[900],
                        letterSpacing: '-0.025em'
                    }}>
                        Mock Roleplay Evaluation
                    </h1>
                    <p style={{ fontSize: '14px', color: COLORS.slate.text, margin: 0 }}>
                        Review and analyze staff performance records
                    </p>
                </div>

                {/* SEARCH INPUT */}
                <div style={{ position: 'relative', marginLeft: 'auto' }}>
                    {/* Search Icon */}
                    <svg
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                        }}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={COLORS.gray[400]}
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>

                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '10px 16px 10px 38px',
                            fontSize: '14px',
                            border: `1px solid ${COLORS.slate.border}`,
                            borderRadius: SPACING.pillRadius,
                            width: '200px',
                            outline: 'none',
                            transition: SPACING.transition,
                            background: COLORS.slate.bg,
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = COLORS.indigo;
                            e.target.style.boxShadow = SPACING.focusRing;
                            e.target.style.background = 'white';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = COLORS.slate.border;
                            e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                            e.target.style.background = COLORS.slate.bg;
                        }}
                    />
                </div>
            </div>

            {/* ================================================================
          TABLE CONTAINER
          ================================================================ */}
            <div style={{
                background: 'white',
                borderRadius: SPACING.cardRadius,
                border: `1px solid ${COLORS.slate.border}`,
                overflow: 'hidden',
                boxShadow: SPACING.cardShadow
            }}>

                {/* STATS BAR */}
                <div style={{
                    padding: SPACING.statsPadding,
                    borderBottom: `1px solid ${COLORS.slate.light}`,
                    background: `rgba(248, 250, 252, 0.5)`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '12px', color: COLORS.slate.text, fontWeight: '500' }}>
                        Showing {filteredRecords.length} of {records.length} records
                    </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                        {/* TABLE HEADER */}
                        <thead>
                            <tr style={{ background: 'white', borderBottom: `1px solid ${COLORS.slate.border}` }}>
                                <th style={{
                                    padding: SPACING.cellPaddingFirst,
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: COLORS.slate.text,
                                    textAlign: 'left',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    RECORD ID
                                </th>
                                <th style={{
                                    padding: SPACING.cellPadding,
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: COLORS.slate.text,
                                    textAlign: 'left',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    DATE EVALUATED
                                </th>
                                <th style={{
                                    padding: SPACING.cellPadding,
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: COLORS.slate.text,
                                    textAlign: 'left',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    OVERALL SCORE
                                </th>
                                <th style={{
                                    padding: SPACING.cellPadding,
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: COLORS.slate.text,
                                    textAlign: 'left',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    LEARNING BEHAVIOR
                                </th>
                            </tr>
                        </thead>

                        <tbody style={{ background: 'white' }}>
                            {filteredRecords.map((record) => {
                                // Calculate badge styles using helper functions
                                const scoreBadgeStyle = getScoreBadgeStyle(record.sop_tag || '');
                                const learningBehaviorStyle = getLearningBehaviorColor(
                                    record.sop_tag === 'Strong' ? 'Fully Engaged' : 'Partially Engaged'
                                );

                                return (
                                    <tr
                                        key={record.id}
                                        style={{
                                            borderBottom: `1px solid ${COLORS.slate.light}`,
                                            cursor: 'pointer',
                                            transition: SPACING.transition,
                                            position: 'relative',
                                            borderLeft: '4px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = `linear-gradient(to right, ${COLORS.indigoLight}, ${COLORS.purpleLight})`;
                                            e.currentTarget.style.borderLeftColor = COLORS.indigo;
                                            e.currentTarget.style.boxShadow = SPACING.hoverShadow;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.borderLeftColor = 'transparent';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* RECORD ID */}
                                        <td style={{
                                            padding: SPACING.cellPaddingFirst,
                                            fontSize: '13px',
                                            color: COLORS.gray[900],
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                            fontWeight: '500'
                                        }}>
                                            {record.id.slice(0, 16)}...
                                        </td>

                                        {/* DATE */}
                                        <td style={{ padding: SPACING.cellPadding }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontSize: '13px', color: COLORS.slate.dark }}>
                                                    {new Date(record.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span style={{ fontSize: '11px', color: COLORS.gray[400] }}>
                                                    {new Date(record.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>

                                        {/* OVERALL SCORE BADGE */}
                                        <td style={{ padding: SPACING.cellPadding }}>
                                            {record.sop_tag && record.sop_tag !== 'N/A' ? (
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '5px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        borderRadius: SPACING.badgeRadius,
                                                        backgroundColor: scoreBadgeStyle.bg,
                                                        color: scoreBadgeStyle.color,
                                                        border: `1px solid ${scoreBadgeStyle.border}`,
                                                        transition: SPACING.transition,
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                        e.currentTarget.style.boxShadow = SPACING.badgeShadow;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    {record.sop_tag}
                                                </span>
                                            ) : (
                                                <span style={{ color: COLORS.gray[400], fontSize: '13px', fontStyle: 'italic' }}>
                                                    N/A
                                                </span>
                                            )}
                                        </td>

                                        {/* LEARNING BEHAVIOR BADGE */}
                                        <td style={{ padding: SPACING.cellPadding }}>
                                            {record.sop_tag && record.sop_tag !== 'N/A' ? (
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '5px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        borderRadius: SPACING.badgeRadius,
                                                        backgroundColor: learningBehaviorStyle.bg,
                                                        color: learningBehaviorStyle.color,
                                                        border: `1px solid ${learningBehaviorStyle.border}`,
                                                        transition: SPACING.transition
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                        e.currentTarget.style.boxShadow = SPACING.badgeShadow;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    {record.sop_tag === 'Strong' ? 'Fully Engaged' : 'Partially Engaged'}
                                                </span>
                                            ) : (
                                                <span style={{ color: COLORS.gray[400], fontSize: '13px', fontStyle: 'italic' }}>
                                                    N/A
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* EMPTY STATE */}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <svg
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={COLORS.gray[300]}
                                                strokeWidth="2"
                                            >
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <path d="m21 21-4.35-4.35"></path>
                                            </svg>

                                            <p style={{
                                                color: COLORS.gray[400],
                                                fontSize: '14px',
                                                fontStyle: 'italic',
                                                margin: 0
                                            }}>
                                                No records found matching "{searchQuery}"
                                            </p>

                                            <button
                                                onClick={() => setSearchQuery('')}
                                                style={{
                                                    padding: '6px 16px',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    color: COLORS.indigo,
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// 4. STYLING PATTERNS & CODE SNIPPETS
// ============================================================================

/**
 * PATTERN 1: GRADIENT ROW HOVER EFFECT
 * 
 * Creates a subtle gradient background with left border accent and shadow
 * 
 * Usage:
 */
const PATTERN_GRADIENT_HOVER = `
<tr
  style={{
    borderLeft: '4px solid transparent',
    transition: 'all 0.2s',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))';
    e.currentTarget.style.borderLeftColor = '#6366f1';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(99, 102, 241, 0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'white';
    e.currentTarget.style.borderLeftColor = 'transparent';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
`;

/**
 * PATTERN 2: INTERACTIVE BADGE WITH SCALE
 * 
 * Badge that scales up and shows shadow on hover
 * 
 * Usage:
 */
const PATTERN_INTERACTIVE_BADGE = `
<span
  style={{
    display: 'inline-block',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: '700',
    borderRadius: '8px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
    transition: 'all 0.2s',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  Strong
</span>
`;

/**
 * PATTERN 3: SEARCH INPUT WITH FOCUS RING
 * 
 * Modern search input with pill shape and indigo focus ring
 * 
 * Usage:
 */
const PATTERN_SEARCH_INPUT = `
<input
  type="text"
  placeholder="Search..."
  style={{
    padding: '10px 16px 10px 38px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    width: '200px',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#f8fafc',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
  }}
  onFocus={(e) => {
    e.target.style.borderColor = '#6366f1';
    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
    e.target.style.background = 'white';
  }}
  onBlur={(e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    e.target.style.background = '#f8fafc';
  }}
/>
`;

/**
 * PATTERN 4: BEFORE/AFTER COLOR-CODED DISPLAY
 * 
 * Shows transition with arrow and color-coded states
 * 
 * Usage:
 */
const PATTERN_BEFORE_AFTER = `
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ fontWeight: '600', fontSize: '12px', color: '#dc2626' }}>
    Negative
  </span>
  <span style={{ color: '#94a3b8' }}>→</span>
  <span style={{ fontWeight: '600', fontSize: '12px', color: '#16a34a' }}>
    Positive
  </span>
</div>
`;

/**
 * PATTERN 5: DATE + TIME SPLIT DISPLAY
 * 
 * Shows date and time with different font sizes
 * 
 * Usage:
 */
const PATTERN_DATE_TIME = `
<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
  <span style={{ fontSize: '13px', color: '#475569' }}>
    Jan 19, 2026
  </span>
  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
    05:30 PM
  </span>
</div>
`;

// ============================================================================
// 5. QUICK REFERENCE
// ============================================================================

/**
 * STYLING GUIDELINES
 * 
 * Typography:
 * - Monospace IDs: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
 * - Headers: uppercase + letterSpacing '0.5px' + fontWeight 700 + fontSize 11px
 * - Titles: fontWeight 700 + letterSpacing '-0.025em' + fontSize 20px
 * - Empty states: fontStyle 'italic'
 * 
 * Shadows:
 * - Container: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
 * - Hover item: '0 4px 6px -1px rgba(99, 102, 241, 0.1)'
 * - Focus ring: '0 0 0 3px rgba(99, 102, 241, 0.1)'
 * - Badge hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
 * 
 * Transitions:
 * - Standard: 'all 0.2s'
 * 
 * Spacing:
 * - Cell padding: '14px 20px'
 * - First column: '14px 20px 14px 24px'
 * - Container: '16px 20px'
 * - Stats bar: '12px 20px'
 * 
 * Border Radius:
 * - Cards: '12px'
 * - Badges: '8px'
 * - Pills: '9999px'
 * 
 * Pro Tips:
 * 1. Use helper functions for color coding consistency
 * 2. Apply transitions to parent, not individual properties
 * 3. Combine gradient + border + shadow for best hover effects
 * 4. Scale badges to 1.05 (not more) for subtle animation
 * 5. Use rgba with low opacity (0.05-0.1) for subtle effects
 * 6. Match shadow colors to primary color for cohesion
 * 7. Keep timing consistent at 0.2s for all transitions
 * 8. Use system font stacks for cross-platform consistency
 */

export default ModernStyledTable;
