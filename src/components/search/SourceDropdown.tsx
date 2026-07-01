import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import { useEffect, useState } from 'react'

import { useApiRequest } from '../../hooks/useApiRequest'
import { SourcesInfoResponse } from '../../types/apiResponseTypes'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const SourceDropdown = () => {
    const { data, status, error, makeRequest } = useApiRequest<SourcesInfoResponse>()
    const [options, setOptions] = useState<{ label: string; value: string; status: string }[]>([])
    const [selectedOptions, setSelectedOptions] = useState<{ label: string; value: string; status: string }[]>([])
    
    const fetchSources = async () => {
        makeRequest({
        method: 'GET',
        url: '/sources',
        });
    };

    useEffect(() => {
            fetchSources();

        }, []
    );
    
    useEffect(() => {
        if (data?.sources) {
            let formattedOptions = data.sources.map((source) => ({
                label: source.source_name.toUpperCase(),
                value: source.source_name,
                status: source.status,
            }));
            setOptions(formattedOptions);

            const defaultSelectedOptions = formattedOptions.filter(option => option.status === 'ok');
            setSelectedOptions(defaultSelectedOptions);
        }
    }, [data]);

    console.log('SourceDropdown data:', data);
    return (    
        <Autocomplete
            multiple
            options={options}
            value={selectedOptions}
            onChange={(event, newValue) => setSelectedOptions(newValue)}
            getOptionLabel={(option) => option.label}
            getOptionDisabled={(option) => option.status !== 'ok'}
            renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                <li key={key} {...optionProps}>
                    <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                    />
                    {option.label}
                </li>
                );
            }}
            renderInput={(params) => <TextField {...params} label="Source" />}
            
        />
    )
}
