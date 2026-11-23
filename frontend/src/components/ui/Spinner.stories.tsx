import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'

const meta = { title: 'UI/Spinner', component: Spinner } satisfies Meta<typeof Spinner>
export default meta

export const Padrao: StoryObj<typeof meta> = {}
