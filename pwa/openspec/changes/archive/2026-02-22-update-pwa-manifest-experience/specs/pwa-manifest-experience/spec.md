## ADDED Requirements
### Requirement: Manifest member governance
The system SHALL maintain a manifest member decision matrix that covers all manifest members listed in MDN's web app manifest reference and classifies each as Adopted, Deferred, or Not applicable with rationale.

#### Scenario: Manifest review is repeatable
- **WHEN** maintainers review or update the web app manifest
- **THEN** each documented manifest member has an explicit decision state
- **AND** deferred or excluded members include a short reason tied to support or product fit

### Requirement: Stable app identity and launch entry
The system SHALL define a stable install identity and launch entry in the manifest using `id`, `start_url`, and `scope` values that remain valid when deployed under the configured base path.

#### Scenario: Install remains associated after route/start changes
- **WHEN** the installed app is launched after non-breaking URL adjustments
- **THEN** the browser still recognizes the app as the same installed application
- **AND** the app starts within the intended scoped window

### Requirement: App-like launcher and splash assets
The system SHALL provide install assets that support launcher fidelity and splash generation, including at least one general-purpose icon and one maskable icon in recommended high-resolution sizes.

#### Scenario: Install icon quality is preserved
- **WHEN** the app is installed on platforms with adaptive icon masks
- **THEN** a maskable icon is available for shaped icon rendering
- **AND** a non-maskable icon remains available for platforms that use standard icon rendering

#### Scenario: Splash appearance uses manifest launch colors
- **WHEN** a platform generates splash or launch surfaces from manifest metadata
- **THEN** splash backgrounds and app chrome use manifest-defined colors and icon assets

### Requirement: Chrome color and runtime metadata consistency
The system SHALL keep manifest color metadata and HTML runtime metadata aligned so app chrome and startup appearance are visually consistent between installed and browser contexts.

#### Scenario: Theme metadata does not conflict
- **WHEN** the app is opened in browser and installed modes
- **THEN** `theme_color` and related metadata produce consistent top-level chrome color treatment

### Requirement: Install surface metadata richness
The system SHALL include supported metadata that improves install UX and discoverability, including descriptive text and at least one visual promotional asset set.

#### Scenario: Rich install prompt can use manifest metadata
- **WHEN** a browser supports richer install UI sourced from manifest metadata
- **THEN** the manifest provides descriptive and visual metadata fields that the browser can display
- **AND** unsupported browsers ignore these fields without breaking installability

### Requirement: Platform fallback documentation
The system SHALL document known platform gaps where manifest fields are ignored and define required fallbacks for those platforms.

#### Scenario: iOS launch behavior is explicitly handled
- **WHEN** maintainers evaluate splash and app-like behavior on iOS/iPadOS
- **THEN** documentation states which launch/splash behaviors are not manifest-driven
- **AND** required fallback tags or assets are specified where applicable
