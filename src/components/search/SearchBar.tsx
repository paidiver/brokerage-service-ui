import { Button } from '@mui/material'
import Box from '@mui/material/Box'

import { SourceDropdown } from './SourceDropdown'

const SearchBar = () => {
    return (
        <Box display="flex" flexDirection="row" alignItems="center" gap="2rem" width="100%">
            <Box>
                <p>{"{{ filter icon component }}"}</p>
            </Box>
            <Box flex={1} display="flex" flexDirection="row" alignItems="center" gap="1rem">
                <p>{"{{ search input component }}"}</p>
                <Button variant="contained" color="primary">
                    Search
                </Button>
            </Box>
            <Box>
                <p>{"{{ children option }}"}</p>
            </Box>
            <Box>
                <SourceDropdown />
            </Box>
        </Box>
    )
}

export default SearchBar
