# MDXRenderer Documentation

The MDXRenderer is a powerful component that allows you to render MDX content with Shadcn UI components. This document explains how to use the MDXRenderer and all the available components.

## Quick Start

```tsx
import { MDXRenderer } from "@/components/mdx/MDXRenderer";
import { serialize } from "next-mdx-remote/serialize";

// In your component:
const mdxSource = await serialize(mdxContent);
<MDXRenderer content={mdxSource} />;
```

## Available Components

The MDXRenderer supports all standard Markdown elements plus the following enhanced components:

### Custom Components

#### FileDisplay

Displays file information with type in square brackets and name/size in parentheses.

```tsx
<FileDisplay
  type='pdf'
  filename='document.pdf'
  size='2.5MB'
/>
```

### Basic UI Components

#### Button

```tsx
<Button>Default Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="destructive">Destructive Button</Button>
```

#### Card

```tsx
<Card className='p-4'>
  <h3>Card Title</h3>
  <p>Content inside the card</p>
</Card>
```

#### ScrollArea

For scrollable content with a fixed height.

```tsx
<ScrollArea className='h-72 w-full border p-4'>
  <div>Content that will scroll</div>
</ScrollArea>
```

### Dropdown Menu

```tsx
<Dropdown trigger={<Button>Open Menu</Button>}>
  <DropdownItem>Option 1</DropdownItem>
  <DropdownItem>Option 2</DropdownItem>
</Dropdown>
```

### Accordion

For collapsible content sections.

```tsx
<Accordion
  type='single'
  collapsible
>
  <AccordionItem value='item-1'>
    <AccordionTrigger>Section Title</AccordionTrigger>
    <AccordionContent>Content that can be collapsed</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Tabs

For tabbed content.

```tsx
<Tabs defaultValue='tab1'>
  <TabsList>
    <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
    <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value='tab1'>Content for tab 1</TabsContent>
  <TabsContent value='tab2'>Content for tab 2</TabsContent>
</Tabs>
```

### Avatar

For user profiles or avatars.

```tsx
<Avatar>
  <AvatarImage src='https://example.com/avatar.jpg' />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Alert Dialog

For confirmation dialogs.

```tsx
<Alert
  trigger={<Button>Open Alert</Button>}
  title='Alert Title'
  description='Alert description text'
  cancelText='Cancel'
  confirmText='Confirm'
>
  <p>Optional additional content</p>
</Alert>
```

### Data Visualization

#### Bar Chart

```tsx
<BarChart
  data={[
    { name: "A", value: 100 },
    { name: "B", value: 200 },
  ]}
  keys={["value"]}
  xAxisKey='name'
  title='Chart Title'
  height={300}
  stacked={false}
  horizontal={false}
/>
```

#### Line Chart

```tsx
<LineChart
  data={[
    { name: "A", value: 100, series2: 150 },
    { name: "B", value: 200, series2: 220 },
  ]}
  keys={["value", "series2"]}
  xAxisKey='name'
  title='Chart Title'
  curved={true}
  height={300}
/>
```

#### Pie Chart

```tsx
<PieChart
  data={[
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
  ]}
  title='Pie Chart'
  donut={true}
  height={300}
/>
```

### Images with AspectRatio

For responsive images with fixed aspect ratio.

```tsx
<AspectRatio ratio={16 / 9}>
  <img
    src='https://example.com/image.jpg'
    alt='Description'
  />
</AspectRatio>
```

## Component Properties

### FileDisplay

| Property | Type   | Description                      |
| -------- | ------ | -------------------------------- |
| type     | string | File type (image, pdf, etc.)     |
| filename | string | Name of the file                 |
| size     | string | Size of the file (e.g., "2.5MB") |

### BarChart / LineChart

| Property   | Type          | Description                         |
| ---------- | ------------- | ----------------------------------- |
| data       | Array<Object> | Data for the chart                  |
| keys       | string[]      | Keys to use from the data           |
| xAxisKey   | string        | Key for X-axis (default: "name")    |
| height     | number        | Height of the chart (default: 300)  |
| title      | string        | Title of the chart                  |
| colors     | string[]      | Custom colors for the chart         |
| stacked    | boolean       | Whether bars should be stacked      |
| horizontal | boolean       | For horizontal bars (BarChart only) |
| curved     | boolean       | For curved lines (LineChart only)   |

### PieChart

| Property    | Type          | Description                          |
| ----------- | ------------- | ------------------------------------ |
| data        | Array<Object> | Data for the chart                   |
| height      | number        | Height of the chart (default: 300)   |
| title       | string        | Title of the chart                   |
| colors      | string[]      | Custom colors for the chart          |
| donut       | boolean       | Whether to show as donut chart       |
| innerRadius | number        | Inner radius for donut (default: 60) |
| outerRadius | number        | Outer radius (default: 80)           |

### Alert

| Property    | Type      | Description                     |
| ----------- | --------- | ------------------------------- |
| trigger     | ReactNode | Element that triggers the alert |
| title       | string    | Title of the alert              |
| description | string    | Description text                |
| children    | ReactNode | Additional content              |
| cancelText  | string    | Text for cancel button          |
| confirmText | string    | Text for confirm button         |

## Usage Example

```tsx
import { MDXRenderer } from "@/components/mdx/MDXRenderer";
import { serialize } from "next-mdx-remote/serialize";

export default function ContentPage() {
  const mdxContent = `
# Example Content

This is an example with a custom component:

<FileDisplay type="pdf" filename="document.pdf" size="2.5MB" />

And a chart:

<BarChart 
  data={[
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 }
  ]}
  keys={['value']}
  title="Example Chart"
/>
  `;

  const [serializedContent, setSerializedContent] = useState(null);

  useEffect(() => {
    async function serializeMdx() {
      const serialized = await serialize(mdxContent);
      setSerializedContent(serialized);
    }
    serializeMdx();
  }, []);

  if (!serializedContent) return <div>Loading...</div>;

  return <MDXRenderer content={serializedContent} />;
}
```
