export const orderByMap: Record<string, { field: string; ascending: boolean }> =
  {
    date: {
      field: 'created_at',
      ascending: false,
    },
    'date-reverse': {
      field: 'created_at',
      ascending: true,
    },
    name: {
      field: 'name',
      ascending: true,
    },
    'name-reverse': {
      field: 'name',
      ascending: false,
    },
    downloads: {
      field: 'downloads',
      ascending: true,
    },
  }
