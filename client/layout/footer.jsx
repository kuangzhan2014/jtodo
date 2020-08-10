import '../assets/styles/footer.styl'

export default {
  data() {
    return {
      author: 'Zhou',
    }
  },
  render() {
    return (
      <div id="footer">
        <span>Wrtitten by {this.author}</span>
      </div>
    )
  },
}
