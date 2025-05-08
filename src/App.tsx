import { useMemo, useState } from 'react'
import './App.css'
import { SortBy, User } from './types'
import { UserList } from './components/UserList'

import { useUsers } from './hooks/useUsers'
import { Results } from './components/Results'
import { useQueryClient } from '@tanstack/react-query'

// useQuery no es un hook, pensado para paginación infinita

function App() {
  
  const {isLoading, isError, users, refetch, fetchNextPage, hasNextPage} = useUsers()

  const queryClient = useQueryClient()

  const [showColorRows, setColorRows] = useState(false)

  //Ahora utilizaremos un Enum en el useState para hacer el último punto de la prueba.
  //const [sortByCountry, setSortByCountry] = useState(false)
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE)

  //? es mejor usar un useRef para guardar el estado original de los usuarios y no usar useState, ya que useState es para guardar el estado actual y no el original.
  //* const [originalUsers, setOriginalUsers] = useState<User[]>([])// esto estaría mal, es innecesario
  //! useRef ->> es para guardar un valor que queremos que se comparta entre renderizados, pero que al cambiar, no vuelva a renderizar el componente. Y para cuando queremos guardar valores que se preserven entre renderizados (esto también es una caracteristica del useState, pero este si cambia su valor se vuelve a renderizar el componente).
  //const originalUsers = useRef<User[]>([]) 

  const [filteredCountry, setFilteredCountry] = useState<string | null>(null)  

  const toggleColorRows = () => {
    setColorRows(!showColorRows)
    //console.log({showColorRows})
  }

  const toggleSortByCountry = () => {
    //const newSortingValue = sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE
    const newSortingValue = sorting === SortBy.COUNTRY ? SortBy.NONE : SortBy.COUNTRY
    setSorting(newSortingValue)
    //setSortByCountry(prevState => !prevState) 
  }

  const handleChangeSort = (sort: SortBy) => {
    setSorting(sort)
  }

  const handleDelete = (email: string) => {
    queryClient.setQueryData<{
      pages: { users: User[]; nextCursor?: number} []
      pageParams: number[]
    }> (
      ["users"],
      (oldData) => {
        if (!oldData) return oldData // Si no hay datos, no hacemos nada

        return {
          ...oldData,
          pages: oldData.pages.map( page => ({
            ...page,
            users: page.users.filter( user => user.email !== email) // <-- Acá filtramos los usuarios, y eliminamos el que tiene el email que le pasamos por parámetro. Esto es lo que hace el filter, devuelve un nuevo array con los elementos que cumplen la condición. En este caso, los que no tienen el email que le pasamos por parámetro.            
          }))
        }
      }
    )   
  }

  const handleReset = async () => {    
    console.log("Resetear estado")
    await refetch() // <-- Esto es para volver a cargar los usuarios desde la API, y no desde el estado. Es decir, vuelve a hacer la petición a la API y carga los usuarios de nuevo. Esto es lo que hace el refetch.       
  }

  
  const filteredUsers = useMemo( () => {    
    console.log("Se volvió a calcular filteredUsers")
    return typeof filteredCountry === "string" && filteredCountry.length > 0
      ? users.filter( (user) => {
        return user.location.country.toLowerCase().includes(filteredCountry.toLowerCase())
      }) : users
  }, [users, filteredCountry]) //* Acá le pasamos las dependencias, que son los usuarios y el país filtrado. Si alguno de estos cambia, se vuelve a calcular el valor de filteredUsers. Si no le pasamos las dependencias, se volvería a calcular cada vez que se renderiza el componente.

  
  const sortedUsers = useMemo( () => {
    console.log("Se volvió a calcular sortedUsers")

    if(sorting === SortBy.COUNTRY){
      return [...filteredUsers].sort(
        (a, b) => a.location.country.localeCompare(b.location.country)
      )
    }

    if(sorting === SortBy.NAME){
      return [...filteredUsers].sort(
        (a, b) => a.name.first.localeCompare(b.name.first)
      )
    }

    if(sorting === SortBy.LAST_NAME){
      return [...filteredUsers].sort(
        (a, b) => a.name.last.localeCompare(b.name.last)
      )
    }

    return filteredUsers

  }, [filteredUsers, sorting]) //* Acá le pasamos las dependencias, que son los usuarios filtrados y ordenados por el país. Si alguno de estos cambia, se vuelve a calcular el valor de sortedUsers. Si no le pasamos las dependencias, se volvería a calcular cada vez que se renderiza el componente.  

  return (
    <div className="app">
      <h1>Euro Prueba T</h1>
        <Results />
        <header>
            <button onClick={toggleColorRows} className="btn">
              {showColorRows ? 'Ocultar color' : 'Mostrar color'}
            </button>

            <button onClick={toggleSortByCountry} className="btn">
              {sorting === SortBy.COUNTRY ? "Sin ordenar por país" : "Ordenar por país"}
            </button>

            <button onClick={handleReset} className="btn">
                Resetear Estado
            </button>

            <input type="text" placeholder="Filtrar por país" onChange={ (e) => {
              setFilteredCountry(e.target.value)
            }}/>
            
        </header>

      <main>
          { users.length > 0 && 
          <UserList users={sortedUsers} showColorRows={showColorRows} deleteUser={handleDelete} changeSorting={handleChangeSort}/>}

          { isLoading && <p>Cargando...</p>}
          { isError && <p>Error al cargar los usuarios</p>}
          { !isLoading && !isError && users.length === 0 && <p>No hay usuarios</p>}           

          {/* Le ponemos === true porque el hasNextPage es nulleable, y si no hay más páginas, es undefined y si hay es true, pero como es nulleable tenemos que declarar la condición explícitamente (es buena práctica no obligatoria) */}
          { !isLoading && !isError && users.length > 0 && hasNextPage === true && <button onClick={ () => fetchNextPage() }>Cargar más resultados</button>}    

          { !isLoading && !isError && !hasNextPage && <p>No hay más resultados</p>}
      </main>      
    </div>    
  )
}

export default App
