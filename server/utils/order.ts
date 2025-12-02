export const orderByMap: Record<string, { field: string; ascending: boolean }> =
  {
    date: {
      field: 'createdAt',
      ascending: false,
    },
    'date-reverse': {
      field: 'createdAt',
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
