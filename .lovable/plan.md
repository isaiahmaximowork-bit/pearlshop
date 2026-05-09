As requested, I will implement a more organized and feature-rich Video Style selector, grouped by categories (Tabs), and update the backend prompts to incorporate the provided professional guidance for Hooks, Unboxing, and Dancinhas.

### 1. UI Enhancements (StudioStepFinal & StudioStepPrompt)
- **Tabs for Video Styles**: Replace the simple grid with Tabs (Hooks, Dancinhas, Unboxing, Outros).
- **New Video Style Options**:
    - **Hooks**: Mão na Câmera, Apontando para Texto, Estalo de Dedos (Snap), Zoom de Impacto, Lançamento para Câmera.
    - **Dancinhas**: Sincronia com Batida, Desfile de Passarela, Giro 360, Vibe TikTok, Transição de Look.
    - **Unboxing**: Rasgando o Lacre, Abrindo a Caixa (POV), Retirando Papel de Seda, Primeiro Contato, Unboxing Minimalista.
    - **Outros**: UGC Autêntico, Publicitário, Close-up, Mirror Selfie.
- **Conditional Visibility**:
    - **POV Camera**: Show only specific interaction modes (demonstrating/unboxing) and disable irrelevant ones like "Pose do Avatar".
    - **Front Camera**: Show all options normally, including the new Unboxing modes.
- **Step 4 Sync**: Ensure the Video Style selected in Step 3 is accurately reflected and used in the Step 4 prompt generation.

### 2. Backend Enhancements (Edge Functions)
- **Prompt Injection**: Update `generate-ugc` and `generate-veo3-prompt` to include the specific technical instructions from the provided document (Shot specification, action sequences, etc.) when one of the new styles is selected.
- **Improved Action Sequences**: Use the detailed prompt examples (ASMR for unboxing, specific technical camera movements for hooks) to guide the AI.
- **Input Optimization**: Send only the relevant style instructions to the AI to keep input tokens efficient.

### Technical Details
- **Files to modify**:
    - `src/components/studio/types.ts`: Update `VideoStyle` and `TakeConfig` types.
    - `src/components/studio/StudioStepFinal.tsx`: Implement Tabs, update style lists, and add logic for camera-specific visibility.
    - `src/components/studio/StudioStepPrompt.tsx`: Ensure it uses the new styles and displays the selection modal if multi-take manual mode is active.
    - `supabase/functions/generate-ugc/index.ts`: Update system prompts with the new cinematographic principles.
    - `supabase/functions/generate-veo3-prompt/index.ts`: Integrate the new movement choreography logic.
- **Asset Check**: Verify if any new icons are needed from Lucide.
