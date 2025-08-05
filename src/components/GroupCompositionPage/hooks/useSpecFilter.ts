import { useState } from 'react';

export const useSpecFilter = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<number | null>(null);
  
  const handleClassChange = (classId: number | null) => {
    setSelectedClass(classId);
    setSelectedSpec(null); // Reset spec when class changes
  };
  
  const handleSpecChange = (specId: number | null) => {
    setSelectedSpec(specId);
  };
  
  const clearFilter = () => {
    setSelectedClass(null);
    setSelectedSpec(null);
  };
  
  return {
    selectedClass,
    selectedSpec,
    handleClassChange,
    handleSpecChange,
    clearFilter
  };
}; 