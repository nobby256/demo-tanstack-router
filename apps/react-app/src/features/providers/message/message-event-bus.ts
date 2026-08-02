import mitt from 'mitt'

export interface PageMessageItem {
  level: string
  message: string
}

export interface FieldMessageItem {
  field: string
  message: string
}

type MessageEvents = {
  pageMessage: {
    items: PageMessageItem[]
  }

  fieldMessage: {
    items: FieldMessageItem[]
    form: unknown
  }

  alertMessage: {
    message: string
  }
}

export const messageEventBus = mitt<MessageEvents>()
