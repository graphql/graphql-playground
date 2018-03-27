import swal from 'sweetalert2'

export function errify(error: Error | string) {
  const message = typeof error === 'string' ? error : error.message
  swal({
    title: 'Error',
    text: message,
    type: 'error',
    confirmButtonText: 'Ok',
  })
}
