export default defineAppConfig({
  ui: {
    colors: {
      neutral: 'light-gray',
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
        base: 'cursor-pointer',
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
  },
})
