# MDR System Interaction Diagram

## Core System Flow

```mermaid
graph TB
    subgraph Input Layer
        UI[Touch Input]
        GS[Gesture System]
    end
    
    subgraph Processing Layer
        IS[Input System]
        PS[Physics System]
        WS[World System]
        RS[Render System]
    end
    
    subgraph State Layer
        GStore[Game Store]
        WStore[World Store]
        SStore[Settings Store]
    end
    
    subgraph Output Layer
        SC[Skia Canvas]
        AS[Audio System]
        HS[Haptic System]
        FS[Feedback System]
    end
    
    UI --> GS
    GS --> IS
    IS --> PS
    IS --> WS
    PS --> GStore
    PS --> WStore
    WS --> WStore
    WStore --> RS
    GStore --> RS
    RS --> SC
    GStore --> FS
    FS --> AS
    FS --> HS
    
    classDef inputNode fill:#e1f5fe
    classDef processNode fill:#f3e5f5
    classDef stateNode fill:#e8f5e8
    classDef outputNode fill:#fff3e0
    
    class UI,GS inputNode
    class IS,PS,WS,RS processNode
    class GStore,WStore,SStore stateNode
    class SC,AS,HS,FS outputNode
```

## Game Loop Architecture

```mermaid
sequenceDiagram
    participant U as User Touch
    participant I as Input System
    participant P as Physics System
    participant W as World System
    participant R as Render System
    participant F as Feedback System
    
    loop Every Frame (60+ fps)
        U->>I: Touch Event
        I->>I: Process Gesture
        I->>P: Update Cursor Input
        P->>P: Apply Physics
        P->>W: Update World State
        W->>W: Update Number Positions
        W->>W: Check Lasso Collisions
        W->>R: Prepare Render Data
        R->>R: Draw Frame
        
        alt Capture Event
            W->>F: Trigger Feedback
            F->>F: Play Audio + Haptic
        end
    end
```

## Input Mode State Machine

```mermaid
stateDiagram-v2
    [*] --> Exploration
    Exploration --> PinpointEntry: TouchStart + Hold
    PinpointEntry --> Pinpoint: Timer > 200ms
    PinpointEntry --> Exploration: TouchEnd
    Pinpoint --> LassoMode: TouchMove + Trail
    LassoMode --> Capture: TouchEnd + Loop Closed
    LassoMode --> Pinpoint: TouchMove + Trail Reset
    Capture --> Exploration: Validation Complete
    Pinpoint --> Exploration: TouchEnd + No Trail
    
    Exploration: Pan Camera\nMove Cursor
    PinpointEntry: Visual Feedback\nMode Transition
    Pinpoint: Steering Input\nPrecise Control
    LassoMode: Record Trail\nStabilize Numbers
    Capture: Validate Selection\nTrigger Feedback
```

## Rendering Pipeline

```mermaid
flowchart TD
    Start([Frame Start]) --> Cull[Viewport Culling]
    Cull --> Numbers[Render Numbers]
    Numbers --> Lasso[Render Lasso Trail]
    Lasso --> Cursor[Render Cursor]
    Cursor --> UI[Render UI Elements]
    UI --> Effects[Apply Visual Effects]
    Effects --> Present[Present Frame]
    Present --> End([Frame End])
    
    subgraph Performance Optimizations
        Cull --> |Spatial Partitioning| CullOpt[Only Visible Entities]
        Numbers --> |Instanced Rendering| NumOpt[Batch Number Draws]
        Effects --> |GPU Shaders| EffOpt[Hardware Acceleration]
    end
    
    CullOpt -.-> Numbers
    NumOpt -.-> Lasso
    EffOpt -.-> Present