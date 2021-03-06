import { usersRef } from "../../index";
import { FirestoreDoc, firestoreInstance } from "../..";
import User, { USER_COLLECTION_NAME } from "../model/User";

export default class UserRepo {
  public static async create(user: User): Promise<User> {
    const createdUserRef = usersRef.doc();
    user.verified=false;
    await createdUserRef.set(user, { merge: true });
    const newUser = await (await createdUserRef.get()).data() as User;
    return {...newUser,id:createdUserRef.id};
  }

  public static async findByEmail(
    email: string
  ): Promise<User | undefined> {
    const snapshot = await usersRef.where("email", "==", email).get();
    if (snapshot.empty) return undefined;
    const res: any = [];
    snapshot.forEach((ele) => res.push({ id: ele.id, ...ele.data() }));
    return res[0];
  }
  public static async findByDiscordUsername(
    discordUsername: string
  ): Promise<User | undefined> {
    const snapshot = await usersRef.where("discord_username", "==", discordUsername).get();
    if (snapshot.empty) return undefined;
    const res: any = [];
    snapshot.forEach((ele) => res.push({ id: ele.id, ...ele.data() }));
    return res[0];
  }
  public static async findByName(
    name: string
  ): Promise<User | undefined> {
    const snapshot = await usersRef.where("full_name", "==", name).get();
    if (snapshot.empty) return undefined;
    const res: any = [];
    snapshot.forEach((ele) => res.push({ id: ele.id, ...ele.data() }));
    return res[0];
  }
  public static async findById(id: string): Promise<User | undefined> {
    const snapshot = await usersRef.doc(id).get();
    if (!snapshot.exists) return undefined;
    const data = snapshot.data() as User;
    return { id: snapshot.id, ...data};
  }

  public static async fetchAll(): Promise<FirestoreDoc[] | undefined> {
    const allUsers = await firestoreInstance
      .collection(USER_COLLECTION_NAME)
      .get();
    if (allUsers.empty) return undefined;
    const res: any = [];
    allUsers.forEach((doc) =>
      res.push({
        id: doc.id,
        ...doc.data(),
      })
    );
    return res;
  }
  public static async delete(id: string): Promise<any> {
    const res = await usersRef.doc(id).delete();
    return res;
  }

  public static async update(id: string, updates: any): Promise<any> {
    return usersRef.doc(id).update(updates);
  }

  public static async updatePersonalLinks(
    id: string,
    updates: any
  ): Promise<any> {
    const user = await this.findById(id);
    if (!user) return undefined;
    if (!user.personal_profiles) user.personal_profiles = {};
    user.personal_profiles = { ...user.personal_profiles, ...updates };
    return this.update(id, user);
  }
  public static async joinProjects(
    id: string,
    projectName: string
  ): Promise<any> {
    const user = await this.findById(id);
    if (!user) return undefined;
    if (!user.projects) user.projects = [];
    const pro:Array<string> = user.projects;
    if(!pro.includes(projectName)) {
      pro.push(projectName);
    }else {
      return undefined;
    }
    user.projects = pro;
    return this.update(id, user);
  }
  public static async leaveProject(
    id: string,
    projectName: string
  ): Promise<any> {
    const user = await this.findById(id);
    if (!user) return undefined;
    if (!user.projects) user.projects = [];
    let pro:Array<string> = user.projects;
    if(pro.includes(projectName)) {
      pro = this.arrayRemove(pro,projectName);
    }else {
      return undefined;
    }
    user.projects = pro;
    return this.update(id, user);
  }

  private static arrayRemove(arr:Array<any>, value:any):Array<any> { 
    return arr.filter(function(ele){ 
        return ele != value; 
    });
 }


  public static async updateConnectedAccounts(
    id: string,
    updates: any
  ): Promise<any> {
    const user = await this.findById(id);
    if (!user) return undefined;
    if(!user.discord_username && !!updates.discord?.username) user.discord_username = updates.discord.username;
    if (!user.accounts_connected) user.accounts_connected = {};
    user.accounts_connected = { ...user.accounts_connected, ...updates };
    return this.update(id, user);
  }
}
