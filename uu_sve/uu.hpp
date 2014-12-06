#pragma once 

namespace base64 {

  namespace detail {
    inline int decode_char(char ch) {
	if (ch >= 'A' && ch <= 'Z')
		return ch - 'A' + 0;	
	if (ch >= 'a' && ch <= 'z')
		return ch - 'a' + 26;	
	if (ch >= '0' && ch <= '9')
		return ch - '0' + 52;	
	if (ch == '+')
		return 62;
	if (ch == '/')
		return 63;
	return -1;
   }
  } //namespace

  template<class InputIterator, class OutputIterator>
  inline void decode( InputIterator begin, InputIterator end, OutputIterator out) {
    typedef unsigned char byte;
    typedef unsigned int  word;

    InputIterator it = begin;
    while ( it != end ) {
      word curr = 0;
      int n_bits = 0, i = 0;
      while ( i < 4 ) {
        if (it == end) break;
        int n_ch = detail::decode_char(word(*it++));
        if (n_ch != -1) {
          curr <<= 6;
          curr |= n_ch;
          n_bits += 6;                  
          ++i;
        }
      }
      curr <<= 24 - n_bits;
      for (int i = 0, n = n_bits / 8; i < n; ++i) {
        *out++ = byte((curr & 0x00ff0000) >> 16);
        curr <<= 8;
      }
    }
  }

} //namespace

