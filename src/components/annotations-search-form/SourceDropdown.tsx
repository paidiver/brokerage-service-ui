import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import { SourcesInfoResponse } from '../../api/types'
import { useApiRequest } from '../../hooks/useApiRequest'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const ALL_OPTION = { label: 'ALL', value: 'all', status: 'ok' }
const POLL_INTERVAL_MS = 10 * 60 * 1000
const MAX_VISIBLE_LABELS = 1

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
                <Typography  sx={{ fontWeight: 'bold' }}>ALL</Typography>
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

export const SourceDropdown = ({ selectedSources, onSelectedSourcesChange }: { selectedSources: string[]; onSelectedSourcesChange: (sources: string[]) => void  }) => {
    const { data, makeRequest } = useApiRequest<SourcesInfoResponse>();
    const [options, setOptions] = useState<SourceOption[]>([]);

    useEffect(() => {
        makeRequest({ method: 'GET', url: '/sources' })

        const interval = setInterval(() => {
            makeRequest({ method: 'GET', url: '/sources' })
        }, POLL_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [makeRequest])

    useEffect(() => {
        if (data?.sources) {
            const formattedOptions = data.sources.map((source) => ({
                label: source.source_name.toUpperCase(),
                value: source.source_name,
                status: source.status,
            }))
            setOptions(formattedOptions)

            const healthySources = formattedOptions
                .filter((o) => o.status === 'ok')
                .map((o) => o.value)
            onSelectedSourcesChange(healthySources)
        }
    }, [data])

    const enabledOptions = options.filter((o) => o.status === 'ok');
    const selectedOptionObjects = options.filter((o) => selectedSources.includes(o.value))

    const allSelected =
        enabledOptions.length > 0 &&
        enabledOptions.every((o) => selectedSources.includes(o.value))

    const handleChange = (_: unknown, newValue: SourceOption[]) => {
        const realSelected = newValue.filter((o) => o.value !== 'all')
        onSelectedSourcesChange(realSelected.map((o) => o.value))
    }

    const handleAllToggle = () => {
        onSelectedSourcesChange(
            allSelected ? [] : enabledOptions.map((o) => o.value)
        )
    }

    const autocompleteValue = allSelected
        ? [ALL_OPTION, ...selectedOptionObjects]
        : selectedOptionObjects

    const autocompleteOptions = [ALL_OPTION, ...options];

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
            renderValue={(selectedOptionObjects) => {
                const realSelected = selectedOptionObjects.filter((o) => o.value !== 'all');
                
                const displayText = () => {
                    if (realSelected.length === 0) return '';
                    if (realSelected.length === enabledOptions.length) return 'All';
                    if (realSelected.length <= MAX_VISIBLE_LABELS) {
                        return realSelected.map((o) => o.label).join(', ');
                    }
                    return `${realSelected[0].label} +${realSelected.length - MAX_VISIBLE_LABELS} more`;
                };

                return (
                    <Typography variant="body2" sx={{ px: 0.5, whiteSpace: 'nowrap' }}>
                        {displayText()}
                    </Typography>
                );
            }}
            renderOption={(props, option, { selected }) => {
                if (option.value === 'all') {
                    return (
                        <AllOptionItem
                            key="all"
                            props={props}
                            allSelected={allSelected}
                            someSelected={selectedSources.length > 0}
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
            sx={{ minWidth: 160 }}
        />
    );
};
