"use server"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Linkedin, Instagram, Facebook, Youtube, } from 'lucide-react';

const HomePage = () => {

  const projects = [
    {
      id: 1,
      title: "Project 1",
      description: "Description for Project 1",
      image: "https://via.placeholder.com/150",
      link: "https://github.com/yourusername",
    },
    {
      id: 2,
      title: "Project 2",
      description: "Description for Project 2",
      image: "https://via.placeholder.com/150",
      link: "https://github.com/yourusername",
    },
    {
      id: 3,
      title: "Project 3",
      description: "Description for Project 3",
      image: "https://via.placeholder.com/150",
      link: "https://github.com/yourusername",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-teal-400 to-violet-500 dark:from-teal-700 dark:to-violet-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">สวัสดีครับ! ผมชื่อ มาร์ช</h1>
          <p className="text-xl md:text-2xl mb-8">Back End Developer | เขียนหน้าบ้านได้นิดหน่อยครับ</p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">เกี่ยวกับผม</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-6">
              ผมชอบเขียนโค้ดและสร้างสิ่งที่ผมคิดว่าเป็นประโยชน์ต่อผมและคนอื่น
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-muted dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">โปรเจ็ก</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project?.id} className="hover:shadow-lg transition-shadow bg-card dark:bg-gray-700 border dark:border-gray-600">
                <CardHeader>
                  <CardTitle>{project?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted h-48 mb-4 rounded-md dark:bg-gray-600"></div>
                  <p className="text-muted-foreground mb-4">
                    {project?.description}
                  </p>
                  <Button variant="outline" asChild>
                    <a href={project?.link} target="_blank" rel="noopener noreferrer">ดูเพิ่มเติม</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ช่องทางต่างๆ</h2>
          <div className="max-w-md mx-auto">
            <div className="flex justify-center gap-4 flex-wrap">
              <Button variant="outline" size="icon" asChild>
                <a href="https://github.com/lolymarsh" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://th.linkedin.com/in/poolwadol-tonkham-a73252290" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              {/* <Button variant="outline" size="icon" asChild>
                <a href="https://youtube.com/yourusername" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-5 w-5" />
                </a>
              </Button> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage