# Implementation Guide: Remaining Component Management Pages

This guide provides templates and instructions for implementing the remaining homepage component management pages.

## Template Structure

Each component management page follows this standard structure:

```typescript
"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, updateContent, createContent, deleteContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch } from "@heroui/react";

// 1. Define Interface
interface ComponentData {
  _id: string;
  // ... component-specific fields
  isVisible: boolean;
  order: number;
}

// 2. Page Component
export default function ComponentManagementPage() {
  const [items, setItems] = useState<ComponentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load, Save, Update, Delete functions
  // ...
  
  // Render: Loading -> Error -> Content
}
```

## Components to Implement

### 1. About Section Manager
**Route**: `/control-centre/sections/about`
**Entity**: `abouts` (singleton)

**Fields:**
- label (string)
- heading (string)
- paragraphs (string[]) - textarea with line breaks
- portraitUrl (string)
- codeCard (object):
  - name, role, location, education, experience
  - passion (string[])
- highlights (array of objects):
  - icon, label, value
- signature (string)

### 2. Statistics Manager
**Route**: `/control-centre/sections/statistics`
**Entity**: `statistics` (collection)

**Fields:**
- value (string) - e.g., "5+", "100%"
- label (string) - e.g., "Years Experience"
- description (string)
- icon (string) - Lucide icon name
- order (number)

**Features:**
- Add/edit/delete stats
- Reorder with drag-and-drop
- Preview card appearance

### 3. Skills Manager
**Route**: `/control-centre/sections/skills`
**Entity**: `skills` (collection with nested structure)

**Structure:**
```typescript
interface SkillGroup {
  category: string;
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  icon: string; // react-icons name (e.g., "SiReact")
  brandColor: string;
  proficiency: "learning" | "familiar" | "advanced" | "expert";
}
```

**Features:**
- Manage skill categories
- Add/edit/delete skills within categories
- Set proficiency levels
- Icon picker with brand icons

### 4. Services Manager
**Route**: `/control-centre/sections/services`
**Entity**: `services` (collection)

**Fields:**
- title (string)
- description (string)
- icon (string)
- order (number)

### 5. Projects Manager
**Route**: `/control-centre/sections/projects`
**Entity**: `projects` (collection)

**Fields:**
- title, slug
- shortDescription, description
- thumbnailUrl, screenshots (string[])
- category, techStack (string[])
- features (string[])
- challenges, improvements (string)
- liveUrl, sourceUrl
- isFeatured, isPublished
- seo { title, description }

**Features:**
- Rich project editor
- Image upload integration
- Tech stack chips
- Featured/Published toggles
- SEO metadata

### 6. Experience Manager
**Route**: `/control-centre/sections/experience`
**Entity**: `experiences` (collection)

**Fields:**
- organization, role, employmentType
- location
- startDate, endDate, isCurrent
- status: "current" | "upcoming" | "ongoing" | "completed"
- description
- responsibilities (string[])
- technologies (string[])

**Features:**
- Date range picker
- Current position checkbox
- Status selector
- Timeline preview

### 7. Education Manager
**Route**: `/control-centre/sections/education`
**Entity**: `educations` (collection)

**Fields:**
- degree, institution, field
- period (string)
- description
- highlights (string[])
- icon (string)

### 8. Certifications Manager
**Route**: `/control-centre/sections/certifications`
**Entity**: `certifications` (collection)

**Fields:**
- title, issuer, year
- credentialUrl
- icon, accentColor

### 9. Testimonials Manager
**Route**: `/control-centre/sections/testimonials`
**Entity**: `testimonials` (collection)

**Fields:**
- name, role
- message (textarea)
- rating (number 1-5)
- avatarUrl

**Features:**
- Star rating input
- Avatar upload
- Character count for message

### 10. Blog Manager
**Route**: `/control-centre/sections/posts`
**Entity**: `posts` (collection)

**Fields:**
- title, slug
- excerpt, content (rich text)
- coverImageUrl
- tags (string[])
- category
- readingTime (auto-calculated)
- isPublished, publishedAt
- seo metadata

**Features:**
- Rich text editor for content
- Auto-generate reading time
- Tag management
- Publish scheduling

### 11. Contact Settings
**Route**: `/control-centre/sections/contact`
**Entity**: `settings` (singleton - contact section)

**Fields:**
- Already implemented in Global Settings
- Could add form configuration:
  - Enable/disable subject chips
  - Custom subjects
  - Auto-reply email template
  - Success message customization

## Implementation Steps

### For Each Component:

1. **Create Page File**
   ```bash
   app/control-centre/(dashboard)/sections/[component-name]/page.tsx
   ```

2. **Copy Template**
   - Use Hero Manager (`sections/hero/page.tsx`) as base
   - Adjust interface to match component fields
   - Update entity name in API calls

3. **Customize Form Fields**
   - Replace fields based on component schema
   - Use appropriate input types (Input, Textarea, Switch)
   - Add field descriptions where helpful

4. **Handle Special Cases**
   - **Arrays**: Use Textarea with split/join on newlines
   - **Objects**: Use nested inputs with dot notation
   - **Object Arrays**: Create repeatable field groups
   - **Images**: Link to Media Library with URL input

5. **Add Validation**
   - Required field checks
   - URL format validation
   - Slug uniqueness
   - Character limits

6. **Test Thoroughly**
   - Load existing data
   - Update fields
   - Save changes
   - Verify frontend updates

## Reusable Patterns

### Array of Strings (Tags, Technologies)
```typescript
<Textarea
  label="Technologies (one per line)"
  value={data.technologies?.join("\n") || ""}
  onChange={(e) => 
    updateField("technologies", e.target.value.split("\n").filter(Boolean))
  }
/>
```

### Object Array (Highlights, Features)
```typescript
{data.highlights?.map((highlight, index) => (
  <div key={index} className="space-y-2">
    <Input
      label={`Highlight ${index + 1}`}
      value={highlight.label}
      onChange={(e) => {
        const updated = [...data.highlights];
        updated[index] = { ...updated[index], label: e.target.value };
        updateField("highlights", updated);
      }}
    />
    <Button
      size="sm"
      color="danger"
      onPress={() => {
        const updated = data.highlights.filter((_, i) => i !== index);
        updateField("highlights", updated);
      }}
    >
      Remove
    </Button>
  </div>
))}
<Button
  onPress={() => {
    const updated = [...(data.highlights || []), { icon: "", label: "", value: "" }];
    updateField("highlights", updated);
  }}
>
  Add Highlight
</Button>
```

### Image Upload Integration
```typescript
<div className="space-y-2">
  <Input
    label="Image URL"
    value={data.imageUrl}
    onChange={(e) => updateField("imageUrl", e.target.value)}
  />
  <Link href="/control-centre/media" target="_blank">
    <Button size="sm" variant="bordered" startContent={<Icon name="Upload" />}>
      Upload to Media Library
    </Button>
  </Link>
</div>
```

### Date Picker
```typescript
<Input
  type="date"
  label="Start Date"
  value={data.startDate}
  onChange={(e) => updateField("startDate", e.target.value)}
/>
```

### Slug Auto-Generation
```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// In onChange handler:
onChange={(e) => {
  updateField("title", e.target.value);
  updateField("slug", generateSlug(e.target.value));
}}
```

## Backend Considerations

### API Endpoints Required

All existing endpoints should work via the generic EntityManager system:

- `GET /admin/content/:entity` - List items
- `GET /admin/content/:entity/:id` - Get single item
- `POST /admin/content/:entity` - Create item
- `PATCH /admin/content/:entity/:id` - Update item
- `DELETE /admin/content/:entity/:id` - Delete item

### Additional Endpoints Needed

1. **Component Visibility**
   ```
   PATCH /admin/components/visibility/:key
   Body: { isVisible: boolean }
   ```

2. **Navigation Reordering**
   ```
   POST /admin/navigation/reorder
   Body: { items: [{ _id, order }] }
   ```

3. **Enhanced Analytics**
   ```
   GET /admin/analytics/enhanced?days=7
   GET /admin/analytics/projects/detail/:slug
   ```

4. **Bulk Operations**
   ```
   POST /admin/content/:entity/bulk-update
   Body: { ids: string[], updates: object }
   ```

## Testing Checklist

For each implemented page:

- [ ] Page loads without errors
- [ ] Existing data displays correctly
- [ ] All fields are editable
- [ ] Save button works
- [ ] Success message appears
- [ ] Data persists after save
- [ ] Frontend reflects changes
- [ ] Validation prevents invalid data
- [ ] Error states display properly
- [ ] Loading states show during API calls
- [ ] Mobile responsive layout works
- [ ] Icons display correctly

## Performance Optimization

1. **Debounce Auto-Save**
   ```typescript
   const debouncedSave = useMemo(
     () => debounce((data) => saveData(data), 1000),
     []
   );
   ```

2. **Optimistic Updates**
   ```typescript
   // Update UI immediately
   setItems(prev => prev.map(item => 
     item._id === id ? { ...item, ...updates } : item
   ));
   
   // Then sync with backend
   updateContent(entity, id, updates).catch(() => {
     // Revert on error
     loadItems();
   });
   ```

3. **Lazy Load Images**
   ```typescript
   <img loading="lazy" src={thumbnailUrl} alt={title} />
   ```

## Accessibility

- Use semantic HTML elements
- Provide labels for all form inputs
- Add aria-labels to icon buttons
- Maintain keyboard navigation
- Ensure sufficient color contrast
- Add loading states with screen reader text

## Next Steps

1. Start with simpler components (Statistics, Services)
2. Move to complex ones (Projects, Blog)
3. Test each thoroughly before moving on
4. Document any edge cases discovered
5. Create shared utilities for common patterns
6. Optimize and refactor after all are complete

---

**Priority Order:**
1. Statistics (easiest)
2. Services (simple)
3. About (moderate)
4. Experience & Education (similar patterns)
5. Certifications & Testimonials (similar)
6. Skills (nested structure)
7. Projects (complex)
8. Blog (most complex with rich text)
