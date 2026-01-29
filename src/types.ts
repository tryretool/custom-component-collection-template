// TypeScript type definitions for Mock Roleplay Evaluation Dashboard

export interface RedFlag {
    severity: 'High' | 'Medium' | 'Low';
    title: string;
    evidence: string;
    note: string;
}

export interface SOPAdherence {
    tag: string;
    note: string;
}

export interface SOPStep {
    step_name: string;
    status: 'Covered' | 'Partially Covered' | 'Missed' | 'Incorrect';
    execution_tag: 'Very Weak' | 'Weak' | 'Average' | 'Good' | 'Strong' | 'Very Strong';
    note: string;
    evidence: string;
}

export interface SkillDimension {
    tag: string;
    note: string;
}

export interface SoftSkills {
    communication_clarity_structure: SkillDimension;
    confidence: SkillDimension;
    empathy_kindness_respect_tone: SkillDimension;
    active_listening: SkillDimension;
}

export interface PressureHandling {
    pressure_objection_level: string;
    tag: string;
    note: string;
    evidence: string;
}

export interface LearningBehavior {
    tag: string;
    note: string;
}

export interface Solution {
    short_title: string;
    note_what_was_offered: string;
    evaluation_about_timing_relevance: string;
    impact_judgement_tag: 'Positive' | 'Neutral' | 'Negative';
}

export interface MockRoleplayEvaluation {
    Red_Flags: RedFlag[];
    SOP_Adherence: SOPAdherence;
    SOP_Steps: SOPStep[];
    Soft_Skills: SoftSkills;
    Pressure_Objection_Handling: PressureHandling;
    Learning_Behavior_Engagement: LearningBehavior;
    Alternates_Solutions_Escalations_Discounts: Solution[];
    Strengths_Pointers: string[];
    Weakness_Pointers: string[];
    // Allow audio/transcript to be passed in main object for easier usage
    audio_url?: string;
    transcript?: string;
}

export interface DashboardMetadata {
    staff_name?: string;
    staff_id?: string;
    sop_name?: string;
    call_date?: string;
    call_duration?: string;
    overall_status?: string;
    transcript?: string;
    audio_url?: string;
}
