import { MultiValue, StylesConfig } from "react-select";
import { Player } from "../interfaces/player.interface";
import Select from "react-select/base";
import { useEffect, useState } from "react";

interface PlayerOption {
  value: string;
  label: string;
}

interface PlayerSelectProps {
  players: Player[];
  selectedPlayers: Player[];
  onChange: (selectedPlayers: Player[]) => void;
}

const customStyles: StylesConfig<PlayerOption, true> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#212529",
    borderColor: "#343a40",
    color: "white",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#343a40",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "white",
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: "#495057",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: "white",
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: "white",
    ":hover": {
      backgroundColor: "red",
      color: "white",
    },
  }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? "#007bff" : isFocused ? "#495057" : "#343a40",
    color: "white",
    ":hover": {
      backgroundColor: "#495057",
    },
  }),
  input: (styles) => ({
    ...styles,
    color: "white",
  }),
};

const PlayerSelect = ({
  players,
  selectedPlayers,
  onChange,
}: PlayerSelectProps) => {
  const [options, setOptions] = useState<PlayerOption[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOptions: PlayerOption[] = selectedPlayers.map((player) => ({
    value: player.id ?? "",
    label: player.name,
  }));

  const handleChange = (selectedOptions: MultiValue<PlayerOption>) => {
    const selectedPlayers = selectedOptions
      ? selectedOptions
          .map((option) => players.find((p) => p.id === option.value))
          .filter((p): p is Player => p !== undefined)
      : [];
    onChange(selectedPlayers);
  };
  const handleCloseMenu = () => setIsMenuOpen(false);
  const handleOpenMenu = () => setIsMenuOpen(true);

  const handleSearch = (inputValue: string) => {
    setSearchTerm(inputValue);
  };

  useEffect(() => {
    const filteredPlayers = players.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setOptions(
      filteredPlayers.map((player) => ({
        value: player.id ?? "",
        label: player.name,
      }))
    );
  }, [players, searchTerm]);

  return (
    <Select
      options={options}
      value={selectedOptions}
      isMulti
      onChange={handleChange}
      placeholder="Select players..."
      className="basic-multi-select"
      classNamePrefix="select"
      inputValue={searchTerm}
      onInputChange={handleSearch}
      onMenuOpen={handleOpenMenu}
      onMenuClose={handleCloseMenu}
      menuIsOpen={isMenuOpen}
      styles={customStyles}
    />
  );
};

export default PlayerSelect;
