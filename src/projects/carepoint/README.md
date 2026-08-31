# CarePoint Integration Contract & Guide

## Project Status: Coming Soon / Under Development

CarePoint is an independent healthcare product concept currently being engineered in another development environment.

### Integration Contract:

When the completed CarePoint frontend application is ready, follow these simple steps to mount it into the GraffGrid platform:

1. **Copy Source Files**:
   Place the CarePoint components, pages, and data into:
   ```
   src/projects/carepoint/
   ```

2. **Verify Base Route**:
   Ensure all internal links and router paths in CarePoint are configured to use or work with the subpath:
   ```
   /work/carepoint
   ```

3. **Mount in `App.tsx`**:
   Import the CarePoint root application wrapper:
   ```tsx
   const CarePointApp = React.lazy(() => import('./projects/carepoint/CarePointWrapper'));
   
   <Route path="/work/carepoint/*" element={<CarePointApp />} />
   ```

4. **Update Project Registry**:
   In `src/config/projects.ts`, change the CarePoint entry status from `"coming-soon"` to `"live"`:
   ```ts
   status: 'live'
   ```

5. **Verify Isolation**:
   Confirm that CarePoint CSS does not leak into the parent portfolio and that the `"← GraffGrid"` escape bar renders cleanly.
