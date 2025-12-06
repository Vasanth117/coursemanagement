# Professional Components Library - Usage Guide

## 🎨 SECE Course Management System Components

This guide provides comprehensive documentation for all reusable components in the system.

---

## 📦 Installation & Setup

### Import Components
```javascript
// Import specific components
import { PrimaryButton, Card, InputField, LoadingSpinner } from '../components/common';

// Or import from specific categories
import { PrimaryButton, SecondaryButton, IconButton } from '../components/common/Button';
import { InputField, SelectField, TextArea } from '../components/common/Form';
```

### Import Styles
Add to your main CSS file (index.css or App.css):
```css
@import './styles/components.css';
```

---

## 🔘 Button Components

### PrimaryButton
Professional gradient button for primary actions.

```javascript
import { PrimaryButton } from '../components/common';

<PrimaryButton 
  onClick={handleSubmit}
  loading={isLoading}
  size="md"
  fullWidth={false}
>
  Submit
</PrimaryButton>
```

**Props:**
- `children` - Button text/content
- `onClick` - Click handler
- `type` - 'button' | 'submit' | 'reset' (default: 'button')
- `disabled` - Boolean (default: false)
- `loading` - Shows spinner (default: false)
- `fullWidth` - Full width button (default: false)
- `size` - 'sm' | 'md' | 'lg' (default: 'md')
- `className` - Additional CSS classes

### SecondaryButton
Outlined button for secondary actions.

```javascript
<SecondaryButton onClick={handleCancel} size="md">
  Cancel
</SecondaryButton>
```

### IconButton
Compact button with icon only.

```javascript
import { FiEdit } from 'react-icons/fi';

<IconButton 
  icon={FiEdit}
  onClick={handleEdit}
  variant="primary"
  size="md"
/>
```

**Variants:** 'primary' | 'secondary' | 'danger' | 'ghost'

---

## 📝 Form Components

### InputField
Professional text input with validation.

```javascript
import { InputField } from '../components/common';
import { FiMail } from 'react-icons/fi';

<InputField
  label="Email Address"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  placeholder="Enter your email"
  icon={FiMail}
  error={errors.email}
  required
/>
```

**Props:**
- `label` - Field label
- `name` - Input name
- `type` - Input type (default: 'text')
- `value` - Input value
- `onChange` - Change handler
- `placeholder` - Placeholder text
- `error` - Error message
- `required` - Shows asterisk (default: false)
- `disabled` - Disabled state (default: false)
- `icon` - Icon component (from react-icons)

### SelectField
Dropdown select with validation.

```javascript
<SelectField
  label="Course"
  name="courseId"
  value={formData.courseId}
  onChange={handleChange}
  options={[
    { value: '1', label: 'Computer Science' },
    { value: '2', label: 'Mathematics' }
  ]}
  placeholder="Select a course"
  error={errors.courseId}
  required
/>
```

### TextArea
Multi-line text input.

```javascript
<TextArea
  label="Description"
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={4}
  placeholder="Enter description"
  error={errors.description}
/>
```

### FileUpload
Drag-and-drop file upload.

```javascript
<FileUpload
  label="Upload Files"
  name="files"
  onChange={handleFileChange}
  accept=".pdf,.doc,.docx"
  multiple
  files={selectedFiles}
  onRemove={handleRemoveFile}
  error={errors.files}
/>
```

### Checkbox
Styled checkbox input.

```javascript
<Checkbox
  label="I agree to terms and conditions"
  name="agree"
  checked={formData.agree}
  onChange={handleChange}
/>
```

---

## 🎴 Layout Components

### Container
Responsive container with max-width.

```javascript
<Container maxWidth="max-w-7xl">
  <h1>Page Content</h1>
</Container>
```

### Card
Professional card with header and content.

```javascript
<Card
  title="Course Details"
  subtitle="View and manage course information"
  headerAction={<PrimaryButton>Edit</PrimaryButton>}
  hover
>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `title` - Card title
- `subtitle` - Card subtitle
- `headerAction` - Action button/component in header
- `padding` - Content padding (default: 'p-6')
- `hover` - Hover effect (default: false)

### Modal
Full-screen modal dialog.

```javascript
import { Modal } from '../components/common';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create New Course"
  size="md"
>
  <form>
    {/* Form content */}
  </form>
</Modal>
```

**Sizes:** 'sm' | 'md' | 'lg' | 'xl'

### Table
Professional data table.

```javascript
<Table
  columns={[
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (value) => <Badge variant="success">{value}</Badge>
    }
  ]}
  data={students}
  onRowClick={(row) => console.log(row)}
/>
```

### Grid
Responsive grid layout.

```javascript
<Grid cols={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

---

## 🧭 Navigation Components

### Breadcrumb
Navigation breadcrumb trail.

```javascript
<Breadcrumb
  items={[
    { label: 'Courses', path: '/courses' },
    { label: 'Computer Science', path: '/courses/1' },
    { label: 'Assignments' }
  ]}
/>
```

### Pagination
Page navigation control.

```javascript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### Tabs
Tabbed navigation.

```javascript
import { FiBook, FiUsers } from 'react-icons/fi';

<Tabs
  tabs={[
    { id: 'courses', label: 'Courses', icon: FiBook, count: 5 },
    { id: 'students', label: 'Students', icon: FiUsers, count: 120 }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

---

## 💬 Feedback Components

### LoadingSpinner
Loading indicator.

```javascript
<LoadingSpinner 
  size="md" 
  text="Loading courses..." 
  fullScreen={false}
/>
```

**Sizes:** 'sm' | 'md' | 'lg'

### SkeletonLoader
Content placeholder while loading.

```javascript
<SkeletonLoader type="card" count={3} />
```

**Types:** 'text' | 'title' | 'card' | 'avatar' | 'button'

### EmptyState
Empty data state.

```javascript
import { FiInbox } from 'react-icons/fi';

<EmptyState
  icon={FiInbox}
  title="No courses found"
  description="Get started by creating your first course"
  action={<PrimaryButton>Create Course</PrimaryButton>}
/>
```

### ErrorMessage
Error display with retry.

```javascript
<ErrorMessage
  message="Failed to load courses"
  onRetry={handleRetry}
/>
```

### SuccessMessage
Success notification.

```javascript
<SuccessMessage message="Course created successfully!" />
```

---

## 📊 Data Display Components

### Badge
Status badge.

```javascript
<Badge variant="success" size="md">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Inactive</Badge>
```

**Variants:** 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'

### Avatar
User avatar with initials fallback.

```javascript
<Avatar 
  src="/path/to/image.jpg"
  name="John Doe"
  size="md"
/>
```

**Sizes:** 'sm' | 'md' | 'lg' | 'xl'

### ProgressBar
Progress indicator.

```javascript
<ProgressBar 
  value={75} 
  max={100}
  variant="primary"
  showLabel
/>
```

**Variants:** 'primary' | 'success' | 'warning' | 'danger'

---

## 🎨 Color Scheme

### Primary Colors
- **Blue**: `#2563eb` (Primary actions, links)
- **Indigo**: `#4f46e5` (Gradients, accents)
- **White**: `#ffffff` (Backgrounds, text on dark)
- **Dark Blue**: `#1e3a8a` (Headers, important text)

### Status Colors
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Yellow)
- **Danger**: `#ef4444` (Red)
- **Info**: `#6366f1` (Indigo)

### Neutral Colors
- **Gray 50**: `#f9fafb` (Light backgrounds)
- **Gray 200**: `#e5e7eb` (Borders)
- **Gray 500**: `#6b7280` (Secondary text)
- **Gray 900**: `#111827` (Primary text)

---

## 🎭 Animation Classes

### Fade Animations
```javascript
<div className="animate-fade-in">Content</div>
```

### Slide Animations
```javascript
<div className="animate-slide-up">Content</div>
<div className="animate-slide-down">Content</div>
```

### Scale Animation
```javascript
<div className="animate-scale-in">Content</div>
```

### Hover Effects
```javascript
<div className="hover-lift">Lifts on hover</div>
<div className="card-hover">Card hover effect</div>
```

### Gradient Backgrounds
```javascript
<div className="gradient-primary">Primary gradient</div>
<div className="gradient-success">Success gradient</div>
```

---

## 📱 Responsive Design

All components are fully responsive and follow mobile-first design principles.

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

---

## 🚀 Example: Complete Form

```javascript
import React, { useState } from 'react';
import {
  Card,
  InputField,
  SelectField,
  TextArea,
  FileUpload,
  Checkbox,
  PrimaryButton,
  SecondaryButton,
  LoadingSpinner,
  ErrorMessage,
  SuccessMessage
} from '../components/common';

const CreateCourseForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    department: '',
    description: '',
    files: [],
    published: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic here
    setLoading(false);
    setSuccess(true);
  };

  if (loading) return <LoadingSpinner fullScreen text="Creating course..." />;

  return (
    <Card title="Create New Course" subtitle="Fill in the course details">
      {success && <SuccessMessage message="Course created successfully!" />}
      {errors.general && <ErrorMessage message={errors.general} />}

      <form onSubmit={handleSubmit}>
        <InputField
          label="Course Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <InputField
          label="Course Code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          required
        />

        <SelectField
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          options={[
            { value: 'cse', label: 'Computer Science' },
            { value: 'ece', label: 'Electronics' }
          ]}
          error={errors.department}
          required
        />

        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          error={errors.description}
        />

        <FileUpload
          label="Course Materials"
          name="files"
          files={formData.files}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            files: Array.from(e.target.files)
          }))}
          accept=".pdf,.doc,.docx"
          multiple
        />

        <Checkbox
          label="Publish immediately"
          name="published"
          checked={formData.published}
          onChange={handleChange}
        />

        <div className="flex space-x-4 mt-6">
          <PrimaryButton type="submit" loading={loading}>
            Create Course
          </PrimaryButton>
          <SecondaryButton type="button">
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </Card>
  );
};

export default CreateCourseForm;
```

---

## 🎯 Best Practices

1. **Consistent Spacing**: Use Tailwind's spacing scale (4, 6, 8, 12, etc.)
2. **Color Usage**: Stick to the defined color palette
3. **Animations**: Use sparingly for professional feel
4. **Accessibility**: All components include focus states and ARIA labels
5. **Responsive**: Test on mobile, tablet, and desktop
6. **Loading States**: Always show feedback during async operations
7. **Error Handling**: Display clear error messages
8. **Form Validation**: Validate on submit and show field-level errors

---

## 📞 Support

For issues or questions about components, refer to:
- Component source code in `src/components/common/`
- Tailwind CSS documentation
- React Icons library

---

**Built with ❤️ for SECE Course Management System**
