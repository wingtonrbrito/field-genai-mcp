'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Button,
  Stack,
  TextInput,
  Card,
  Badge,
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import {
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { IconUpload, IconX, IconFile, IconSparkles } from '@tabler/icons-react';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);

  const form = useForm<FormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
    },
    validate: {
      email: (value) => {
        if (!value) return null; // Email is optional
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
      },
    },
  });

  const populateFromDocumentMutation = trpc.form.populateFromDocument.useMutation({
    onSuccess: (result) => {
      if (result.data) {
        form.setValues({
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          phone: result.data.phone || '',
          email: result.data.email || '',
          address: result.data.address || '',
        });

        setHasExtracted(true);

        const fieldsPopulated = Object.values(result.data).filter(v => v && v !== '').length;

        notifications.show({
          title: 'AI Extraction Complete!',
          message: `Successfully populated ${fieldsPopulated} fields from your document`,
          color: 'green',
          icon: <CheckCircleIcon className="w-4 h-4" />,
        });
      }
    },
    onError: (error) => {
      notifications.show({
        title: 'Extraction Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  const handleFileDrop = async (files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) return;

      populateFromDocumentMutation.mutate({
        documentBase64: base64,
        documentType: selectedFile.type === 'application/pdf' ? 'pdf' : 'image',
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = (values: FormData) => {
    console.log('Form values:', values);
    notifications.show({
      title: 'Success',
      message: 'Form submitted successfully!',
      color: 'green',
      icon: <CheckCircleIcon className="w-4 h-4" />,
    });
  };

  const handleExport = () => {
    const data = form.values;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'Data Exported',
      message: 'Form data has been downloaded as JSON',
      color: 'blue',
    });
  };

  const handleReset = () => {
    setFile(null);
    setHasExtracted(false);
    form.reset();
    notifications.show({
      title: 'Form Reset',
      message: 'All fields have been cleared',
      color: 'gray',
    });
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">
            <Group>
              <SparklesIcon className="w-8 h-8 text-blue-600" />
              Field AI - Smart Form Auto-Population
            </Group>
          </Title>
          <Text size="lg" c="dimmed">
            Upload documents to automatically fill out forms with AI
          </Text>
        </div>

        <Paper shadow="sm" p="xl" radius="lg" withBorder>
          <LoadingOverlay visible={populateFromDocumentMutation.isPending} />

          {!file ? (
            <>
              <Text size="sm" fw={600} mb="md">Upload Document for AI Extraction</Text>
              <Dropzone
                onDrop={handleFileDrop}
                maxSize={10 * 1024 ** 2}
                accept={[MIME_TYPES.pdf, ...Object.values(MIME_TYPES).filter(type => type.startsWith('image/'))]}
              >
                <Group justify="center" gap="xl" style={{ minHeight: 200, pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={50} className="text-blue-500" />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={50} className="text-red-500" />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconFile size={50} className="text-gray-500" />
                  </Dropzone.Idle>

                  <div className="text-center">
                    <Text size="xl" inline mb="xs">
                      Drop your document here or click to select
                    </Text>
                    <Text size="sm" c="dimmed" inline>
                      Supports PDF and image files up to 10MB
                    </Text>
                    <Text size="xs" c="dimmed" mt="sm">
                      AI will automatically extract contact information
                    </Text>
                  </div>
                </Group>
              </Dropzone>
            </>
          ) : (
            <Stack align="center" gap="md">
              <IconFile size={60} className="text-blue-500" />
              <Badge size="xl" variant="filled" radius="md">
                {file.name}
              </Badge>
              <Text size="sm" c="dimmed">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Text>

              {hasExtracted && (
                <Alert icon={<IconSparkles size={16} />} color="green" radius="md">
                  <Text size="sm" fw={500}>AI extraction complete!</Text>
                  <Text size="xs" c="dimmed">Form fields have been auto-populated. Review and edit as needed.</Text>
                </Alert>
              )}

              <Button
                leftSection={<ArrowPathIcon className="w-4 h-4" />}
                variant="outline"
                onClick={handleReset}
              >
                Upload New Document
              </Button>
            </Stack>
          )}
        </Paper>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group mb="md">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            <Title order={3}>Contact Information</Title>
            {hasExtracted && (
              <Badge color="green" variant="light" leftSection={<IconSparkles size={14} />}>
                AI Populated
              </Badge>
            )}
          </Group>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="Enter first name"
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Enter last name"
                  {...form.getInputProps('lastName')}
                />
              </Group>

              <TextInput
                label="Phone"
                placeholder="Enter phone number"
                {...form.getInputProps('phone')}
              />

              <TextInput
                label="Email"
                type="email"
                placeholder="Enter email address"
                {...form.getInputProps('email')}
              />

              <TextInput
                label="Address"
                placeholder="Enter address"
                {...form.getInputProps('address')}
              />

              <Group justify="space-between" mt="xl">
                <Group>
                  <Button variant="outline" onClick={handleReset} type="button">
                    Reset
                  </Button>
                  <Button
                    variant="light"
                    leftSection={<ArrowDownTrayIcon className="w-4 h-4" />}
                    onClick={handleExport}
                    type="button"
                  >
                    Export JSON
                  </Button>
                </Group>
                <Button type="submit">
                  Submit
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}