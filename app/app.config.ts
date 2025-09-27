export default defineAppConfig({
  ui: {
    colors: {
      neutral: 'light-gray',
    },

    button: {
      slots: {
        base: 'cursor-pointer'
      }
    },

    checkbox: {
      slots: {
        base: 'cursor-pointer',
        label: 'cursor-pointer'
      }
    },

    navigationMenu: {
      slots: {
        link: 'cursor-pointer'
      }
    }
  }
})