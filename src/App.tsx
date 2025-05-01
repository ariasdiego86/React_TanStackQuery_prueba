import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { SortBy, type User } from './types'
import { UserList } from './components/UserList'
import { mockData } from './mockData'
import { useQuery } from '@tanstack/react-query'

//let originalUsers: User[] = [] //esto estaría mal, es innecesario

const fetchUsers = async (currentPage: number) => {
      const response = await fetch(`https://randomuser.me/api/?results=10&seed=barkita&page=${currentPage}`)//la seed es para que siempre nos devuelva los mismos usuarios, y no cambien cada vez que se carga la página. Page es para la paginación

      console.log(response.ok, response.status, response.statusText)      

        //"así se manaje el error en la respuesta, el try catch es para manejar capturar errores en la ejecución del código, y el if(!response.ok) es para manejar errores en la respuesta de la API. Si la respuesta no es ok, se lanza un error y se captura en el catch."
      if(!response.ok){          
          throw new Error("Error en la petición")
      }

      const data = await response.json()        

      //valida si es undifined o null (el !data?.results)
      if(!data?.results || data.results.length === 0 || ! Array.isArray(data.results)){
        console.log("No hay usuarios")
        throw new Error("No hay usuarios")
      }     

      return data.results  
}

function App() {

  //const {isLoading, isError, data} = useQuery(["users"], async () => await fetchUsers(1))

  const [users, setUser] = useState<User[]>([])

  const [showColorRows, setColorRows] = useState(false)

  //Ahora utilizaremos un Enum en el useState para hacer el último punto de la prueba.
  //const [sortByCountry, setSortByCountry] = useState(false)
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE)

  //? es mejor usar un useRef para guardar el estado original de los usuarios y no usar useState, ya que useState es para guardar el estado actual y no el original.
  //* const [originalUsers, setOriginalUsers] = useState<User[]>([])// esto estaría mal, es innecesario
  //! useRef ->> es para guardar un valor que queremos que se comparta entre renderizados, pero que al cambiar, no vuelva a renderizar el componente. Y cuando queremos guardar valores que se preserven entre renderizados (esto también es una caracteristica del useState, pero este si cambia su valor se vuelve a renderizar el componente).
  const originalUsers = useRef<User[]>([]) 

  const [filteredCountry, setFilteredCountry] = useState<string | null>(null)

  //Segunda clase, react Query y más
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  

  const toggleColorRows = () => {
    setColorRows(!showColorRows)
    //console.log({showColorRows})
  }

  const toggleSortByCountry = () => {
    const newSortingValue = sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE
    setSorting(newSortingValue)
    //setSortByCountry(prevState => !prevState) 
  }

  const handleChangeSort = (sort: SortBy) => {
    setSorting(sort)
  }

  const handleDelete = (email: string) => {
    const filteredUsers = users.filter( (user) => user.email !== email)
    setUser(filteredUsers)    
  }

  const handleReset = () => {
    //? setUser(originalUsers) Usar useState para resetear el estado no es necesario.
    setUser(originalUsers.current)    
  }

  const useMockData = () => {
    console.log("Simulando datos de la API, y simulación de paginación")
    setError(false)
    try {
      const userPage = 10
      const start = (currentPage -1) * userPage
      const end = start + userPage
      const pageUsers = mockData.results.slice(start, end) //slice es para cortar el array y paginarlo. El primer parámetro es el índice de inicio y el segundo es el índice de fin. Si no le pasamos el segundo parámetro, corta hasta el final del array.

      if(!pageUsers || pageUsers.length === 0 ){
        throw new Error("No hay usuarios de los mocks")
      }

      if(start >= mockData.results.length){
        console.log("No hay más usuarios para cargar")
        return
      }

      setUser(prevUsers => prevUsers.concat(pageUsers))
      originalUsers.current = mockData.results

    }catch (error){
      console.log(`Error al cargar los mocks: ${error}`)
      setError(true)
    }
  }

  /* useEffect( () => {
    fetch('https://randomuser.me/api/?results=10')
      .then(async response => await response.json())
      .then( data => {
        setUser(data.results)
        //* setOriginalUsers(data.results) esto estaría mal, es innecesario
        originalUsers.current = data.results //esto es lo correcto, ya que useRef no vuelve a renderizar el componente y no es necesario usar useState.
      })
      .catch( error => {
        console.log(error)
      })
    
  }, []) */ 

  

  useEffect( () => {    
    setLoading(true)
    setError(false)
    //Esta función se puede sacar del useEffect y ponerla fuera, y siempre solo se ejecutará una vez, ya que el useEffect solo se ejecuta una vez cuando el componente se monta. Conviene sacar la función si es muy larga o si se va a usar en otro lado. En este caso no es necesario, pero es una buena práctica.
    const fetchAndSetUsers = async () => {
      console.log("Se volvió a ejecutar el useEffect")
      try{    
        const results = await fetchUsers(currentPage)          
        
        
        //setUser(data.results) Quitamos esto para la paginación
        //! .concat() es más "tolerante": funciona si le das un solo elemento o un array.
        //! [...spread] es más "exigente": necesita que todo lo que expandas sea iterable (un array, string, etc.).
        setUser(prevUsers => {
          const newUsers = prevUsers.concat(results)
          originalUsers.current = newUsers
          return newUsers
        })

        /* El nuevo código es el de arriba para setear lo usuarios y los origanalUsers 
        setUser(prevUsers => prevUsers.concat(data.results))        
        originalUsers.current = data.results  */

        //esto es lo correcto, ya que useRef no vuelve a renderizar el componente y no es necesario usar useState.
        //setUser(prevState => [...prevState, ...data.results]) esto es para la paginación, para que se agreguen los nuevos usuarios a los que ya tenemos. Si no lo hacemos, se reemplazarán los usuarios que ya tenemos por los nuevos.
  
      }catch(error){        
        setError(true)         
        console.log(`Egrrrrrrror en API: ${error}`)
        //useMockData()
      }
      finally{
        setLoading(false)
      }
    }

    fetchAndSetUsers()

  }, [currentPage]) //! []: solo corre una vez (cuando el componente se monta), [estado]: se vuelve a ejecutar si ese estado cambia. Ahora le pasamos el estado de currentPage, para que cada vez que cambie, se vuelva a ejecutar el useEffect y se carguen más usuarios.

  

  /* const filteredUsers = typeof filterCountry === "string" && filterCountry.length > 0 
  ? users.filter( (user) => {
    return user.location.country.toLowerCase().includes(filterCountry.toLowerCase())      
  }) : users */
  //* Ahora usaremos useMemo para evitar que se vuelva a calcular el valor de filteredUsers y sortedUsers (este para evitar reordenar) cada vez que se renderiza el componente. Esto es útil cuando tenemos una lista grande de usuarios y queremos filtrar por país o reordenarlos, ya que si no usamos useMemo, se volvería a calcular el valor de filteredUsers y sortedUsers cada vez que se renderiza el componente, lo que podría ser innecesario y costoso en términos de rendimiento.

  
  const filteredUsers = useMemo( () => {    
    console.log("Se volvió a calcular filteredUsers")
    return typeof filteredCountry === "string" && filteredCountry.length > 0
      ? users.filter( (user) => {
        return user.location.country.toLowerCase().includes(filteredCountry.toLowerCase())
      }) : users
  }, [users, filteredCountry]) //* Acá le pasamos las dependencias, que son los usuarios y el país filtrado. Si alguno de estos cambia, se vuelve a calcular el valor de filteredUsers. Si no le pasamos las dependencias, se volvería a calcular cada vez que se renderiza el componente.
 
  

  //structuredClone(users).sort((a,b) =>) es otra forma de hacer una copia del array, pero esta hace una copia profunda y no es necesario en este caso. El spread operator hace una copia superficial y es suficiente para este caso.

  /* const sortedUsers = sortByCountry ? [...users].sort( (a, b) => { 
    return a.location.country.localeCompare(b.location.country)
  }) : users */ //* la lista de usuarios ya estará ordenada por el user.sort y por eso es que cuando apretamos el botón de ordenar por país de nuevo no se ve el cambio (es el mismo array), porque ya está ordenada por país. La solución es usar spread operator para crear una copia del array y no modificar el original.

  //console.log({sortByCountry})
  // Aquí pondremos la misma función sortedUser que fitraba los usuarios por país, pero ahora le pondremos filteredUsers y no users, para que filtre los usuarios por país y luego los ordene por país.

  /* const sortedUsers = sortByCountry ? [...filteredUsers].sort( (a, b) => {     
    return a.location.country.localeCompare(b.location.country)
  }) : filteredUsers  */
  
  /* const sortedUsers = useMemo( () => {
    console.log("Se volvió a calcular sortedUsers")
    return sorting === SortBy.COUNTRY ? [...filteredUsers].sort( 
      (a, b) => a.location.country.localeCompare(b.location.country)
    ) : filteredUsers
  }, [filteredUsers, sorting]) */ // Acá le pasamos las dependencias, que son los usuarios filtrados y ordenados por el país. Si alguno de estos cambia, se vuelve a calcular el valor de sortedUsers. Si no le pasamos las dependencias, se volvería a calcular cada vez que se renderiza el componente.  
  //ahora lo haremos para que el sortedUser sirva para reordenar por el país y por el nombre, y no solo por el país.
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
            {/* 
              Quitamos el condicional !loading && !error && users.length > 0 que envolvía al <UserList /> 
              para evitar que se desmonte y monte el componente innecesariamente.
              El principal problema es que `loading` cambia a true cada vez que se hace una petición 
              (cuando se ejecuta el useEffect), lo cual rompe la condición completa y provoca el desmontaje.
              Ahora dejamos que <UserList /> dependa únicamente de `users.length > 0`, 
              que es más estable y no cambia tan seguido, evitando montajes innecesarios.
          */}
            {/* !loading && !error &&  Quitamos esto para evitar que se desmonete y monte el componente cada vez que no se cumple la condición entera "pintarlo"
              El problemas principal está en el !loading ya que este cambia cada vez que se ejecuta el useEffect y si este es true, desmonta el componente y cuando vuelve a cambiar al false, lo vuelve a montar.
            */}
            { users.length > 0 && 
            <UserList users={sortedUsers} showColorRows={showColorRows} deleteUser={handleDelete} changeSorting={handleChangeSort}/>}

            { loading && <p>Cargando...</p>}
            { !loading && error && <p>Error al cargar los usuarios</p>}
            { !loading && !error && users.length === 0 && <p>No hay usuarios</p>}
            

            { !loading && !error && users.length > 0 && <button onClick={ () => {setCurrentPage(currentPage + 1)}}>Cargar más resultados</button>}

            
        
      </main>          
      
      

      
    </div>    
  )
}

export default App

/* if(Array.isArray(data.results)){
          console.log(` Este es un array ${data.results}`)
          console.log(`Error API, cargando mockdata: ${mockData.results}`)
          console.log(`Este es el mockData lenght: ${mockData.results.length}`)

          setUser(prevUsers => prevUsers.concat(mockData.results))
          originalUsers.current = mockData.results
        } */
