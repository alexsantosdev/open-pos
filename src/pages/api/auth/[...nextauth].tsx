import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { ref, set, get, child } from 'firebase/database'

import { database } from '../../../services/firebase'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),   
  ],
  callbacks: {
    async session({ session, user, token }) {
      try{
        let subscription: boolean
        let merchantId: string

        if(session?.user) {
          const dbRef = ref(database)
          await get(child(dbRef, `owner/${token.sub}`)).then((snapshot) => {
            if(snapshot.exists()) {
              subscription = snapshot.val().subscription
              merchantId = snapshot.val().merchant_id
            }
          })
        }

        return {
          ...session,
          subscription,
          merchant_id: merchantId,
          owner_id: token.sub
        }
      }catch {
        return {
          ...session,
          subscription: false
        }
      }
    },
    async signIn({ user, account, profile, email, credentials }) {

      try{
        const dynamicId = Math.random().toString(36).substr(2, 9)

        const ownerReference = await get(ref(database, `owner/${user.id}`))

        if(!ownerReference.exists()) {
          await set(ref(database, `owner/${user.id}`), {
            author: {
              author_id: user.id,
              email: user.email,
            },
            active_subscription: false,
            subscription: false,
            merchant_id: dynamicId
          })
        }

      return true

      }catch {
        return false
      }
    },
  }
})