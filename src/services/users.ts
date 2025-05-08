import { QueryFunctionContext } from '@tanstack/react-query';

export const fetchUsers = async ({pageParam = 1}: QueryFunctionContext) => {
    const response = await fetch(`https://randomuser.me/api/?results=10&seed=barkita&page=${pageParam}`)//la seed es para que siempre nos devuelva los mismos usuarios, y no cambien cada vez que se carga la página. Page es para la paginación

    console.log(response.ok, response.status, response.statusText)      

      //"así se manaje el error en la respuesta, el try catch es para manejar/capturar errores en la ejecución del código, y el if(!response.ok) es para manejar errores en la respuesta de la API. Si la respuesta no es ok, se lanza un error y se captura en el catch."
    if(!response.ok){          
      throw new Error("Error en la petición")
    }

    const data = await response.json()

    //valida si es undifined o null (el !data?.results) el data?.results quiere decir por si solo (Si no es undefined o null, entonces es true) y aquí como se valida utilizamos el operador ! para negar la condición, es decir si es undifned o null pasa el if.
    if(!data?.results || data.results.length === 0 || ! Array.isArray(data.results)){
      console.log("No hay usuarios")
      throw new Error("No hay usuarios")
    }
    
    const currentPage = Number(data.info.page)
    const nextCursor = currentPage > 3 ? undefined : currentPage + 1
    return ({
      users: data.results,
      nextCursor
    })
}