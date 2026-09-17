export const blueScrollbarSx = {
  scrollbarWidth: 'thin',
  scrollbarColor: '#438fca #fff',
  '&::-webkit-scrollbar': { width: 9 },
  '&::-webkit-scrollbar-track': {
    bgcolor: '#fff',
    border: '1px solid',
    borderColor: 'grey.400',
    borderRadius: 5
  },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: '#438fca',
    borderRadius: 5,
    border: '2px solid #fff'
  }
} as const;
