export default defineAppConfig({
  ui: {
    colors: {
      neutral: 'zinc',
      red: 'red',
      orange: 'orange',
      amber: 'amber',
      lime: 'lime',
      emerald: 'emerald',
      teal: 'teal',
      cyan: 'cyan',
      sky: 'sky',
      indigo: 'indigo',
      violet: 'violet',
      fuchsia: 'fuchsia',
      rose: 'rose',
      green: 'green',
      blue: 'blue',
      yellow: 'yellow',
      purple: 'purple',
      pink: 'pink',
    },

    button: {
      slots: {
        base: 'rounded-lg cursor-pointer',
      },
    },

    input: {
      slots: {
        base: 'rounded-lg',
      },
    },

    textarea: {
      slots: {
        base: 'rounded-lg',
      },
    },

    select: {
      slots: {
        base: 'rounded-lg',
        content: 'rounded-lg',
      },
    },

    checkbox: {
      slots: {
        base: 'cursor-pointer',
        label: 'cursor-pointer',
      },
    },

    navigationMenu: {
      slots: {
        link: 'cursor-pointer',
      },
    },

    card: {
      slots: {
        root: 'rounded-xl',
      },
    },

    modal: {
      slots: {
        overlay: 'bg-[var(--ui-bg-light-dark)]/30 backdrop-blur-xs',
        content: 'rounded-xl!',
      },
    },
  },
})
