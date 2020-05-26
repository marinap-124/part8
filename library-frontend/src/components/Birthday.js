import React, { useState }   from 'react'
import { UPDATE_YEAR,  ALL_AUTHORS } from '../queries'
import { useMutation } from '@apollo/client'
import Select from 'react-select';

const SelectComponent = ({handleChange, names, selectedOption}) => (
    <Select options={names} 
      value={selectedOption.label}
      onChange={handleChange}
     />
  )

const Birthday = ({authors}) => {
  const [year, setYear] = useState('')
  const [option, setOption] = useState('')

  const [ updateYear ] = useMutation(UPDATE_YEAR, {
    refetchQueries: [ { query: ALL_AUTHORS } ]
  })

  const names = authors.map(a => ({ value: a.name, label: a.name }));

  const submit = async (event) => {
    event.preventDefault()
    updateYear({  variables: { name: option.selectedOption.label, year: parseInt(year, 10) } })

    setOption('')
    setYear('')
  }

  const handleChange = selectedOption => {
    setOption({ selectedOption });
  };

  return (
    <div>
      <h3>Set birthday</h3>
      <form onSubmit={submit}>
        <div>
          <SelectComponent handleChange={handleChange} names={names} selectedOption={option}/>
          born
          <input
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>

        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Birthday