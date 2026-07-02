import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import { useApiRequest } from '../../hooks/useApiRequest'
import { SourcesInfoResponse } from '../../types/apiResponseTypes'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const ALL_OPTION = { label: 'ALL', value: 'all', status: 'ok' }

type SourceOption = { label: string; value: string; status: string }

const StatusDot = ({ status }: { status: string }) => (
    <Box
        component="span"
        sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: status === 'ok' ? 'success.main' : 'error.main',
            display: 'inline-block',
            ml: 'auto',
            flexShrink: 0,
        }}
    />
);

export const SourceDropdown = () => {
    const { data, error, makeRequest } = useApiRequest<SourcesInfoResponse>();
    const [options, setOptions] = useState<SourceOption[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<SourceOption[]>([]);

    const fetchSources = () => {
        makeRequest({ method: 'GET', url: '/sources' });
        if (error) {
            console.error('Error fetching sources:', error);
        }
    }

    useEffect(() => {
        fetchSources();

        const interval = setInterval(() => {
            fetchSources();
        }, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchSources]);

    useEffect(() => {
        if (data?.sources) {
            const formattedOptions = data.sources.map((source) => ({
                label: source.source_name.toUpperCase(),
                value: source.source_name,
                status: source.status,
            }));
            setOptions(formattedOptions);

            setSelectedOptions(formattedOptions.filter((option) => option.status === 'ok'));
        }
    }, [data]);

    const enabledOptions = options.filter((o) => o.status === 'ok');
    const allSelected = enabledOptions.length > 0 && 
        enabledOptions.every((o) => selectedOptions.some((s) => s.value === o.value));

    const handleChange = (_: unknown, newValue: SourceOption[]) => {
        setSelectedOptions(newValue.filter((o) => o.value !== 'all'));
    };

    const handleAllToggle = () => {
        if (allSelected) {
            setSelectedOptions([]);
        } else {
            setSelectedOptions(enabledOptions);
        }
    };

    const autocompleteValue = allSelected
        ? [ALL_OPTION, ...selectedOptions]
        : selectedOptions;

    const autocompleteOptions = [ALL_OPTION, ...options];

    const AllOptionItem = ({
        props,
        allSelected,
        someSelected,
        onToggle,
    }: {
        props: React.HTMLAttributes<HTMLLIElement>;
        allSelected: boolean;
        someSelected: boolean;
        onToggle: () => void;
    }) => {
        const { key, ...optionProps } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;
        return (
            <Box key={key}>
                <li {...optionProps} onClick={onToggle} style={{ cursor: 'pointer' }}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                    />
                    <Typography fontWeight="bold">ALL</Typography>
                </li>
                <Divider />
            </Box>
        );
    };

    const SourceOptionItem = ({
            props,
            option,
            selected,
        }: {
            props: React.HTMLAttributes<HTMLLIElement>;
            option: SourceOption;
            selected: boolean;
        }) => {
            const { key, ...optionProps } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;
            const isDisabled = option.status !== 'ok';

            return (
                <li key={key} {...optionProps}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                        disabled={isDisabled}
                    />
                    <Typography
                        sx={{ flex: 1, color: isDisabled ? 'text.disabled' : 'text.primary' }}
                    >
                        {option.label}
                    </Typography>
                    <StatusDot status={option.status} />
                </li>
            );
        };

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={autocompleteOptions}
            value={autocompleteValue}
            onChange={handleChange}
            getOptionLabel={(option) => option.label}
            getOptionDisabled={(option) => option.value !== 'all' && option.status !== 'ok'}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderValue={() => null}
            renderOption={(props, option, { selected }) => {
                if (option.value === 'all') {
                    return (
                        <AllOptionItem
                            key="all"
                            props={props}
                            allSelected={allSelected}
                            someSelected={selectedOptions.length > 0}
                            onToggle={handleAllToggle}
                        />
                    );
                }

                return (
                    <SourceOptionItem
                        key={option.value}
                        props={props}
                        option={option}
                        selected={selected}
                    />
                );
            }}
            renderInput={(params) => (
                <TextField {...params} label="Source" size="small" />
            )}
            sx={{ minWidth: 180 }}
        />
    );
};
