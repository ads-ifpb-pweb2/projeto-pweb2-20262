import type { Preview } from '@storybook/react-vite'
import '../src/styles/global.css'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default preview
