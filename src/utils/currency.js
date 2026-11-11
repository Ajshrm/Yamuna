const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export function formatCurrency(amount) {
  return inrFormatter.format(Number(amount))
}
