import {  FirestoreDoc, FirestoreDocRef, firestoreInstance, projectsRef } from "../..";
import Project, { PROJECT_COLLECTION_NAME } from "../model/Project";

export default class ProjectRepo {
  public static async create(project: Project): Promise<FirestoreDocRef> {
    const createdProjectRef = await projectsRef.doc();
    createdProjectRef.set(project, { merge: true });
    return createdProjectRef;
  }

  public static async update(id: string, updates: any): Promise<any> {
    await projectsRef.doc(id).update(updates);
  }

  public static async findByName(
    name: string
  ): Promise<FirestoreDoc | undefined> {
    let res: any = [];
    const snapshot = await projectsRef.where("name", "==", name).get();
    if (snapshot.empty) return undefined;
    snapshot.forEach((ele) => res.push({ id: ele.id, ...ele.data() }));
    return res;
  }


  public static async findByFounder(
    name: string
  ): Promise<FirestoreDoc | undefined> {
    let res: any = [];
    const snapshot = await projectsRef.where("founder.full_name", "==", name).get();
    if (snapshot.empty) return undefined;
    snapshot.forEach((ele) => res.push({ id: ele.id, ...ele.data() }));
    return res;
  }


  public static async delete(id: string): Promise<any> {
    const res = await projectsRef.doc(id).delete();
    return res;
  }
  public static async findById(id: string): Promise<FirestoreDoc | undefined> {
    const snapshot = await projectsRef.doc(id).get();
    if (!snapshot.exists) return undefined;
    return { id: snapshot.id, ...snapshot.data() };
  }

  public static async fetchAll(): Promise<FirestoreDoc[] | undefined> {
    const allProjects = await firestoreInstance
      .collection(PROJECT_COLLECTION_NAME)
      .get();
    if (allProjects.empty) return undefined;
    const res: any = [];
    allProjects.forEach((doc) =>
      res.push({
        id: doc.id,
        ...doc.data(),
      })
    );
    return res;
  }
  public static async updateResourcesLinks(
    id: string,
    updates: any
  ): Promise<any> {
    const project = await this.findById(id);
    if(project) delete project["id"];
    if (!project) return undefined;
    if (!project.resources) project.resources = {};
    project.resources = { ...project.resources, ...updates };
    await this.update(id, project);
  }
  public static async joinProject(
    id: string,
    updates: any
  ): Promise<any> {
    const project = await this.findById(id);
    if(project) 
      delete project["id"];
    else 
      return undefined;
    if (!project.teamMembers) project.teamMembers = {};
    project.teamMembers = { ...project.teamMembers, ...updates };
    await this.update(id, project);
  }

  public static async updateWanted(id:string,updates:any):Promise<any>{
    const project = await this.findById(id);
    if(project) delete project["id"];
    if (!project) return undefined;
    if (!project.wanted) project.wanted = {};
    project.wanted = { ...project.wanted, ...updates };
    await this.update(id, project);
  }
}


