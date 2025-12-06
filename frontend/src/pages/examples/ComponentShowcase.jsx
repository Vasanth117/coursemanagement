import React, { useState } from 'react';
import {
  Container,
  Card,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  InputField,
  SelectField,
  TextArea,
  FileUpload,
  Checkbox,
  Table,
  Modal,
  Breadcrumb,
  Pagination,
  Tabs,
  LoadingSpinner,
  SkeletonLoader,
  EmptyState,
  ErrorMessage,
  SuccessMessage,
  Badge,
  Avatar,
  ProgressBar
} from '../../components/common';
import { FiEdit, FiTrash, FiPlus, FiBook, FiUsers, FiSettings } from 'react-icons/fi';

const ComponentShowcase = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    description: '',
    files: [],
    agree: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const tableColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'danger'}>
          {value}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: () => (
        <div className="flex space-x-2">
          <IconButton icon={FiEdit} variant="primary" size="sm" />
          <IconButton icon={FiTrash} variant="danger" size="sm" />
        </div>
      )
    }
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <Container>
        <div className="mb-8 animate-fade-in">
          <Breadcrumb
            items={[
              { label: 'Dashboard', path: '/' },
              { label: 'Examples', path: '/examples' },
              { label: 'Component Showcase' }
            ]}
          />
          <h1 className="text-4xl font-bold text-gradient mt-4">
            Component Showcase
          </h1>
          <p className="text-gray-600 mt-2">
            Professional components for SECE Course Management System
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'buttons', label: 'Buttons', icon: FiPlus },
            { id: 'forms', label: 'Forms', icon: FiEdit },
            { id: 'data', label: 'Data Display', icon: FiBook },
            { id: 'feedback', label: 'Feedback', icon: FiUsers }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-8 space-y-8">
          {activeTab === 'buttons' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="Button Components" subtitle="Primary, Secondary, and Icon buttons">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Primary Buttons</h4>
                    <div className="flex flex-wrap gap-4">
                      <PrimaryButton size="sm">Small Button</PrimaryButton>
                      <PrimaryButton size="md">Medium Button</PrimaryButton>
                      <PrimaryButton size="lg">Large Button</PrimaryButton>
                      <PrimaryButton loading>Loading...</PrimaryButton>
                      <PrimaryButton disabled>Disabled</PrimaryButton>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Secondary Buttons</h4>
                    <div className="flex flex-wrap gap-4">
                      <SecondaryButton size="sm">Small</SecondaryButton>
                      <SecondaryButton size="md">Medium</SecondaryButton>
                      <SecondaryButton size="lg">Large</SecondaryButton>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Icon Buttons</h4>
                    <div className="flex flex-wrap gap-4">
                      <IconButton icon={FiEdit} variant="primary" />
                      <IconButton icon={FiTrash} variant="danger" />
                      <IconButton icon={FiSettings} variant="secondary" />
                      <IconButton icon={FiPlus} variant="ghost" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Badges & Avatars">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Badges</h4>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="primary">Primary</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="danger">Danger</Badge>
                      <Badge variant="info">Info</Badge>
                      <Badge variant="gray">Gray</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Avatars</h4>
                    <div className="flex flex-wrap gap-4 items-end">
                      <Avatar name="John Doe" size="sm" />
                      <Avatar name="Jane Smith" size="md" />
                      <Avatar name="Bob Johnson" size="lg" />
                      <Avatar name="Alice Williams" size="xl" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="Form Components" subtitle="Input fields, selects, and more">
                <form className="space-y-4">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />

                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />

                  <SelectField
                    label="Select Course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    options={[
                      { value: 'cs', label: 'Computer Science' },
                      { value: 'ece', label: 'Electronics' },
                      { value: 'me', label: 'Mechanical' }
                    ]}
                    required
                  />

                  <TextArea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows={4}
                  />

                  <FileUpload
                    label="Upload Files"
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
                    label="I agree to the terms and conditions"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                  />

                  <div className="flex space-x-4">
                    <PrimaryButton type="submit">Submit</PrimaryButton>
                    <SecondaryButton type="button">Cancel</SecondaryButton>
                  </div>
                </form>
              </Card>

              <Card title="Progress Bars">
                <div className="space-y-4">
                  <ProgressBar value={25} variant="primary" />
                  <ProgressBar value={50} variant="success" />
                  <ProgressBar value={75} variant="warning" />
                  <ProgressBar value={90} variant="danger" />
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="Data Table" subtitle="Professional table with actions">
                <Table
                  columns={tableColumns}
                  data={tableData}
                  onRowClick={(row) => console.log('Clicked:', row)}
                />
              </Card>

              <Card title="Pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={10}
                  onPageChange={setCurrentPage}
                />
              </Card>

              <Card title="Empty State">
                <EmptyState
                  title="No courses found"
                  description="Get started by creating your first course"
                  action={
                    <PrimaryButton onClick={() => setModalOpen(true)}>
                      Create Course
                    </PrimaryButton>
                  }
                />
              </Card>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="Messages">
                <div className="space-y-4">
                  <SuccessMessage message="Operation completed successfully!" />
                  <ErrorMessage message="An error occurred. Please try again." />
                </div>
              </Card>

              <Card title="Loading States">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Spinners</h4>
                    <div className="flex space-x-8">
                      <LoadingSpinner size="sm" text="" />
                      <LoadingSpinner size="md" text="" />
                      <LoadingSpinner size="lg" text="" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Skeleton Loaders</h4>
                    <SkeletonLoader type="text" count={3} />
                    <div className="mt-4">
                      <SkeletonLoader type="card" count={1} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Modal Dialog">
                <PrimaryButton onClick={() => setModalOpen(true)}>
                  Open Modal
                </PrimaryButton>
              </Card>
            </div>
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create New Course"
          size="md"
        >
          <form className="space-y-4">
            <InputField
              label="Course Title"
              name="title"
              placeholder="Enter course title"
              required
            />
            <SelectField
              label="Department"
              name="department"
              options={[
                { value: 'cs', label: 'Computer Science' },
                { value: 'ece', label: 'Electronics' }
              ]}
              required
            />
            <div className="flex space-x-4 mt-6">
              <PrimaryButton type="submit">Create</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </Modal>
      </Container>
    </div>
  );
};

export default ComponentShowcase;
